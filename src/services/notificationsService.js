import * as signalR from "@microsoft/signalr";

const NOTIFICATIONS_API_URL =
  import.meta.env.VITE_NOTIFICATIONS_API_URL || "http://localhost:8080";

let connection = null;

export function getUserId(user) {
  return (
    user?.id ||
    user?.userId ||
    user?.user_id ||
    user?.uid ||
    user?.firebaseUid ||
    user?.firebaseUuid ||
    null
  );
}

export async function startNotificationsConnection(
  userId,
  onNotificationReceived
) {
  if (!userId) {
    return null;
  }

  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection;
  }

  const negotiateResponse = await fetch(
    `${NOTIFICATIONS_API_URL}/notifications/negotiate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    }
  );

  if (!negotiateResponse.ok) {
    throw new Error("No se pudo obtener la conexión de SignalR.");
  }

  const negotiateData = await negotiateResponse.json();

  connection = new signalR.HubConnectionBuilder()
    .withUrl(negotiateData.url, {
      accessTokenFactory: () => negotiateData.accessToken,
    })
    .withAutomaticReconnect()
    .build();

  connection.on("notificationReceived", (notification) => {
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });

  await connection.start();

  return connection;
}

export async function stopNotificationsConnection() {
  if (connection) {
    await connection.stop();
    connection = null;
  }
}

export async function getBookLikeStatus(bookId, user) {
  const userId = getUserId(user);

  if (!userId) {
    return {
      liked: false,
      likesCount: 0,
    };
  }

  const response = await fetch(
    `${NOTIFICATIONS_API_URL}/books/${bookId}/like-status?userId=${encodeURIComponent(
      userId
    )}`
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Error HTTP: ${response.status}`);
  }

  return {
    liked: Boolean(data?.liked),
    likesCount: data?.likesCount || 0,
  };
}

export async function toggleBookLike(bookId, actorUser) {
  const actorUserId = getUserId(actorUser);

  const actorName =
    actorUser?.name ||
    actorUser?.username ||
    actorUser?.email ||
    "Un usuario";

  if (!actorUserId) {
    throw new Error("No se pudo identificar el usuario que dio like.");
  }

  const response = await fetch(`${NOTIFICATIONS_API_URL}/books/${bookId}/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      actorUserId,
      actorName,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Error HTTP: ${response.status}`);
  }

  return {
    ...data,
    liked: Boolean(data?.liked),
    likesCount: data?.likesCount || 0,
  };
}

// Compatibilidad temporal por si algún archivo viejo todavía importa esta función.
export async function likeBookAndNotify(bookId, actorUser) {
  return toggleBookLike(bookId, actorUser);
}