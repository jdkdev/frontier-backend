const connection = require('./connection')

/**
 * The Datbase class hands the connection 
 * as well as a layer of abstraction for preparing statements
 * #run() - created
 * #get() - created
 * #all() - created
 * #iterate()
 * #pluck()
 * #expand()
 * #raw()
 * #columns()
 * #bind()
 * #exec()
 */
class Database {
    constructor(name = 'Default', connection) {
        this.name = name
        this.db = connection
    }
    ex(cmd, sql, params = []) {
        console.log({sql, params})
        let stmt = this.db.prepare(sql)
        let result = stmt[cmd](params)
        console.log({result})
        return result
    }
    all(sql, params) {
        return this.ex('all', sql, params)
    }
    get(sql, params) {
        return this.ex('get', sql, params)
    }
    run(sql, params) {
        return this.ex('run', sql, params)
    }
    execSql(sql) {
        return this.db.exec(sql)
    }

}

module.exports = new Database('authDB', connection)