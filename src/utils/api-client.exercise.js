const apiURL = process.env.REACT_APP_API_URL

function client(endpoint, customHeaders = {}, customConfig = {}) {
  const config = {
    method: 'GET',
    headers: {
      ...customHeaders
    },
    ...customConfig,
  }

  return window.fetch(`${apiURL}/${endpoint}`, config).then(async response => {
    console.log('env var url: ', apiURL)

    const data = await response.json()
    if (response.ok) {
      return data
    } else {
      return Promise.reject(data)
    }
  })
}

export {client}
