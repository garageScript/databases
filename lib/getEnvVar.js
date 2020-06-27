
module.exports = (type) => {
    if (type === 'mailgun') return { 
        apiKey: process.env.MAILGUN_API_KEY || '123', 
        domain: process.env.MAILGUN_DOMAIN 
      }
}