export async function fetchCurrentUser() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const res = await fetch(
      "http://localhost:5000/api/protected/me",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}