require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sql = require("mssql");

const app = express();

const PORT = process.env.PORT || 8080;
const SIGNALR_CONNECTION_STRING = process.env.SIGNALR_CONNECTION_STRING;
const SIGNALR_HUB_NAME = process.env.SIGNALR_HUB_NAME || "notifications";

const SQL_CONNECTION_STRING = process.env.SQL_CONNECTION_STRING;

let poolPromise = null;

async function getSqlPool() {
  if (!poolPromise) {
    if (!SQL_CONNECTION_STRING) {
      throw new Error("SQL_CONNECTION_STRING no está configurado.");
    }

    poolPromise = sql.connect(SQL_CONNECTION_STRING);
  }

  return poolPromise;
}

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://brave-sea-03b672010.2.azurestaticapps.net",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Ocp-Apim-Subscription-Key",
    ],
  })
);

app.use(express.json());

function parseSignalRConnectionString() {
  if (!SIGNALR_CONNECTION_STRING) {
    throw new Error("SIGNALR_CONNECTION_STRING no está configurado.");
  }

  const endpointMatch = SIGNALR_CONNECTION_STRING.match(/Endpoint=([^;]+)/);
  const accessKeyMatch = SIGNALR_CONNECTION_STRING.match(/AccessKey=([^;]+)/);

  if (!endpointMatch || !accessKeyMatch) {
    throw new Error("La connection string de SignalR no es válida.");
  }

  return {
    endpoint: endpointMatch[1].replace(/\/$/, ""),
    accessKey: accessKeyMatch[1],
  };
}

function generateSignalRToken(audience, userId = null, expiresInSeconds = 3600) {
  const { accessKey } = parseSignalRConnectionString();

  const now = Math.floor(Date.now() / 1000);

  const payload = {
    aud: audience,
    iat: now,
    exp: now + expiresInSeconds,
  };

  if (userId) {
    payload.nameid = String(userId);

    // Claim adicional compatible con escenarios SignalR/.NET.
    payload[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] = String(userId);
  }

  return jwt.sign(payload, accessKey, {
    algorithm: "HS256",
  });
}

function getClientUrl() {
  const { endpoint } = parseSignalRConnectionString();
  return `${endpoint}/client/?hub=${encodeURIComponent(SIGNALR_HUB_NAME)}`;
}

async function sendToUser(userId, target, payload) {
  const { endpoint } = parseSignalRConnectionString();

  const requestUrl = `${endpoint}/api/hubs/${encodeURIComponent(
    SIGNALR_HUB_NAME
  )}/users/${encodeURIComponent(userId)}/:send`;

  const token = generateSignalRToken(requestUrl, null, 3600);

  const response = await fetch(`${requestUrl}?api-version=2022-11-01`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target,
      arguments: [payload],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Error enviando mensaje a SignalR: ${response.status} ${errorText}`
    );
  }
}

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "API de notificaciones funcionando correctamente",
    service: "api-notifications",
    status: "ok",
  });
});

app.post("/notifications/negotiate", (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId es obligatorio para conectarse a SignalR.",
      });
    }

    const url = getClientUrl();
    const accessToken = generateSignalRToken(url, userId, 3600);

    return res.status(200).json({
      url,
      accessToken,
      userId,
      hub: SIGNALR_HUB_NAME,
    });
  } catch (error) {
    console.error("Error en negotiate:", error);

    return res.status(500).json({
      message: "Error generando conexión SignalR.",
      error: error.message,
    });
  }
});

app.post("/notifications/test-send", async (req, res) => {
  try {
    const { recipientUserId, actorName, bookTitle, message } = req.body;

    if (!recipientUserId) {
      return res.status(400).json({
        message: "recipientUserId es obligatorio.",
      });
    }

    const notification = {
      id: crypto.randomUUID(),
      type: "test",
      recipientUserId,
      actorName: actorName || "Usuario de prueba",
      bookTitle: bookTitle || "Libro de prueba",
      message:
        message ||
        `${actorName || "Usuario de prueba"} le dio me gusta a tu libro ${
          bookTitle || "Libro de prueba"
        }`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    await sendToUser(
      recipientUserId,
      "notificationReceived",
      notification
    );

    return res.status(200).json({
      message: "Notificación enviada correctamente.",
      notification,
    });
  } catch (error) {
    console.error("Error enviando notificación:", error);

    return res.status(500).json({
      message: "Error enviando notificación.",
      error: error.message,
    });
  }
});

app.post("/books/:id/like", async (req, res) => {
  try {
    const bookId = Number(req.params.id);

    const actorUserId =
      req.body.actorUserId ||
      req.body.actor_user_id ||
      req.body.userId ||
      null;

    const actorName =
      req.body.actorName ||
      req.body.actor_name ||
      "Un usuario";

    if (!bookId || Number.isNaN(bookId)) {
      return res.status(400).json({
        message: "El id del libro debe ser válido.",
      });
    }

    if (!actorUserId) {
      return res.status(400).json({
        message: "actorUserId es obligatorio.",
      });
    }

    const pool = await getSqlPool();

    const bookResult = await pool.request()
      .input("book_id", sql.Int, bookId)
      .query(`
        SELECT id, title, user_id
        FROM dbo.Books
        WHERE id = @book_id;
      `);

    if (bookResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Libro no encontrado.",
      });
    }

    const book = bookResult.recordset[0];
    const recipientUserId = book.user_id;

    if (!recipientUserId) {
      return res.status(400).json({
        message: "El libro no tiene usuario dueño asociado.",
      });
    }

    if (String(actorUserId) === String(recipientUserId)) {
      return res.status(400).json({
        message: "No puedes darle me gusta a tu propio libro.",
      });
    }

    const existingLike = await pool.request()
      .input("book_id", sql.Int, bookId)
      .input("actor_user_id", sql.NVarChar(100), actorUserId)
      .query(`
        SELECT id
        FROM dbo.BookLikes
        WHERE book_id = @book_id
          AND actor_user_id = @actor_user_id;
      `);

    if (existingLike.recordset.length > 0) {
      await pool.request()
        .input("book_id", sql.Int, bookId)
        .input("actor_user_id", sql.NVarChar(100), actorUserId)
        .query(`
          DELETE FROM dbo.BookLikes
          WHERE book_id = @book_id
            AND actor_user_id = @actor_user_id;
        `);

      const countResult = await pool.request()
        .input("book_id", sql.Int, bookId)
        .query(`
          SELECT COUNT(*) AS likesCount
          FROM dbo.BookLikes
          WHERE book_id = @book_id;
        `);

      return res.status(200).json({
        message: "Me gusta eliminado.",
        liked: false,
        likesCount: countResult.recordset[0].likesCount,
      });
    }

    await pool.request()
      .input("book_id", sql.Int, bookId)
      .input("actor_user_id", sql.NVarChar(100), actorUserId)
      .input("actor_name", sql.NVarChar(150), actorName)
      .query(`
        INSERT INTO dbo.BookLikes (
          book_id,
          actor_user_id,
          actor_name
        )
        VALUES (
          @book_id,
          @actor_user_id,
          @actor_name
        );
      `);

    const message = `${actorName} le dio me gusta a tu libro "${book.title}"`;

    const notificationResult = await pool.request()
      .input("recipient_user_id", sql.NVarChar(100), recipientUserId)
      .input("actor_user_id", sql.NVarChar(100), actorUserId)
      .input("actor_name", sql.NVarChar(150), actorName)
      .input("book_id", sql.Int, bookId)
      .input("type", sql.NVarChar(50), "like")
      .input("message", sql.NVarChar(500), message)
      .query(`
        INSERT INTO dbo.Notifications (
          recipient_user_id,
          actor_user_id,
          actor_name,
          book_id,
          type,
          message
        )
        OUTPUT
          INSERTED.id,
          INSERTED.recipient_user_id,
          INSERTED.actor_user_id,
          INSERTED.actor_name,
          INSERTED.book_id,
          INSERTED.type,
          INSERTED.message,
          INSERTED.is_read,
          INSERTED.created_at
        VALUES (
          @recipient_user_id,
          @actor_user_id,
          @actor_name,
          @book_id,
          @type,
          @message
        );
      `);

    const countResult = await pool.request()
      .input("book_id", sql.Int, bookId)
      .query(`
        SELECT COUNT(*) AS likesCount
        FROM dbo.BookLikes
        WHERE book_id = @book_id;
      `);

    const savedNotification = notificationResult.recordset[0];

    const notification = {
      id: savedNotification.id,
      type: savedNotification.type,
      recipientUserId: savedNotification.recipient_user_id,
      actorUserId: savedNotification.actor_user_id,
      actorName: savedNotification.actor_name,
      bookId: savedNotification.book_id,
      message: savedNotification.message,
      isRead: Boolean(savedNotification.is_read),
      createdAt: savedNotification.created_at,
    };

    try {
      await sendToUser(
        recipientUserId,
        "notificationReceived",
        notification
      );
    } catch {
      return res.status(201).json({
        message: "Like guardado, pero no se pudo enviar la notificación en tiempo real.",
        liked: true,
        likesCount: countResult.recordset[0].likesCount,
        notification,
      });
    }

    return res.status(201).json({
      message: "Like registrado y notificación enviada.",
      liked: true,
      likesCount: countResult.recordset[0].likesCount,
      notification,
    });
  } catch {
    return res.status(500).json({
      message: "Error registrando like.",
    });
  }
});

app.get("/books/:id/like-status", async (req, res) => {
  try {
    const bookId = Number(req.params.id);
    const userId = req.query.userId;

    if (!bookId || Number.isNaN(bookId)) {
      return res.status(400).json({
        message: "El id del libro debe ser válido.",
      });
    }

    if (!userId) {
      return res.status(400).json({
        message: "userId es obligatorio.",
      });
    }

    const pool = await getSqlPool();

    const result = await pool.request()
      .input("book_id", sql.Int, bookId)
      .input("actor_user_id", sql.NVarChar(100), userId)
      .query(`
        SELECT 
          CASE 
            WHEN EXISTS (
              SELECT 1
              FROM dbo.BookLikes
              WHERE book_id = @book_id
                AND actor_user_id = @actor_user_id
            )
            THEN CAST(1 AS BIT)
            ELSE CAST(0 AS BIT)
          END AS liked,
          (
            SELECT COUNT(*)
            FROM dbo.BookLikes
            WHERE book_id = @book_id
          ) AS likesCount;
      `);

    return res.status(200).json({
      liked: Boolean(result.recordset[0].liked),
      likesCount: result.recordset[0].likesCount,
    });
  } catch {
    return res.status(500).json({
      message: "Error obteniendo estado del like.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`API de notificaciones corriendo en puerto ${PORT}`);
});