function client(endpoint, customConfig = {}) {
  // 🐨 create the config you'll pass to window.fetch
  //    make the method default to "GET"
  // 💰 if you're confused by this, that's fine. Scroll down to the bottom
  // and I've got some code there you can copy/paste.
  // 🐨 call window.fetch(fullURL, config) then handle the json response
  // 📜 https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  // 💰 here's how to get the full URL: `${process.env.REACT_APP_API_URL}/${endpoint}`
  return window
    .fetch(`${process.env.REACT_APP_API_URL}/${endpoint}`, {
      method: 'GET',
      ...customConfig,
    })
    .then(async res => {
      if (res.ok) {
        return res.json()
      } else {
        return Promise.reject(await res.json())
      }
    })
}

export {client}

/*






























💰 spoiler alert below...



























































const config = {
    method: 'GET',
    ...customConfig,
  }
*/
