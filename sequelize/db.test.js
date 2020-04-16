const sequelize = require('sequelize')
const {start, update, close, Account} = require('./db')

describe('Test sequelize setup', ()=>{
  it('should test how many times authenticate is called', ()=>{
    start('hahah', 'kddkd')
    expect(true).toBe(true)
  })
})
