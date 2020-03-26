const rootUrl = 'http://192.168.1.4:5000';

export const request = async (route, method, body, cred) =>
  await (
    await fetch(`${rootUrl}/${route}`, {
      body,
      method: method || 'GET',
      headers: {
        ...cred,
        'Content-Type': 'application/json',
      },
    })
  ).json();
