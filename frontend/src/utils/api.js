export const sendFriendRequest = async (recipientEmail, message, token) => {
  try {
    const res = await fetch("http://localhost:5000/api/friend-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Importante
      },
      body: JSON.stringify({ recipientEmail, message }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al enviar solicitud");
    return data;
  } catch (err) {
    console.error("❌ Error enviando solicitud:", err);
    throw err;
  }
};

export const getFriends = async (token) => {
  try {
    const res = await fetch("http://localhost:5000/api/friends", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al obtener amigos");
    return data;
  } catch (err) {
    console.error("❌ Error obteniendo amigos:", err);
    throw err;
  }
};