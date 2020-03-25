const rootUrl = 'http://192.168.100.6';

const login = async (user, password) => {
    let response = await fetch(
        `${rootUrl}/user/login`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user, password })
        }
    );
    return await response.json();
}

export default {
    login,
    rootUrl,
}