let url = "http://localhost:8001/";

export async function callApiGet(path) {
  try {
    let resp = await fetch(url + path, {
      method: "GET",
      credentials: "include",
    });
    return [resp.status, await resp.json()];
  } catch (error) {
    console.log("error: " + error);
    return ["error", error];
  }
}

export async function callApiPut(path) {
  const myHeaders = new Headers({
    accept: "application/json",
  });
  try {
    let resp = await fetch(url + path, {
      method: "PUT",
      credentials: "include",
      headers: myHeaders,
    });
    return [await resp.json(), resp.status];
  } catch (error) {
    console.log("error: " + error);
    return ["error", error];
  }
}
