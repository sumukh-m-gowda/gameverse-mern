export async function fetchCurrentUser() {
  try {
    const res = await fetch("http://localhost:5000/api/protected/me", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}
