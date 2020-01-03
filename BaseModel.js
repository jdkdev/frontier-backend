const {env} = require('frontier')
const log = require('frontier/lib/logger')
const {v1, v4} = require('frontier/lib/uuid')
const argv = require('frontier/lib/args')()
const fs = require('fs')
const path = require('path')
const DB = require('./Database')

//Migration commands have matching Sql functions
class BaseModel {
    constructor(opts = {meta : true}) {
        return this
    }
    static get table() {
        return 'not_defined'
    }
    static get fields() {
        return []
    }
    static get indexes() {
        return []
    }
    static get fieldsSql() {
        return this.fields.map(({name, type, opts}) => {
            return `\n ${name} ${type} ${opts || 'DEFAULT NULL'}` 
        })
    }
    static tableSql({force = false} = {}) {
        let sql = `
            /*
                CREATE STATEMENT for ${this.table} - ${new Date().toJSON()}
            */
            CREATE TABLE IF NOT EXISTS ${this.table} ( ${this.fieldsSql} 
            );
        `
        return force ? this.dropTableSql + sql : sql
    }
    static indexSql() {
        let state = this.indexes.length ? 'ADD' : 'NO'
        let sql = `
            /*
                ${state} INDEXES for ${this.table} - ${new Date().toJSON()}
            */
        `
        this.indexes.forEach(index => {
            sql += `CREATE INDEX idx_${this.table}_${index} ON ${this.table} (${index});\n`
        })
        return sql
    }
    static dropIndexSql() {
        let sql = `
            /*
                DROP INDEXES for ${this.table} - ${new Date().toJSON()}
            */
        `
        this.indexes.forEach(index => {
            sql += `DROP INDEX idx_${this.table}_${index};\n`
        })
        return sql
    }
    static dropTableSql() {
        return `
            /*
                DROP STATEMENT for ${this.table} - ${new Date().toJSON()}
            */
            DROP TABLE IF EXISTS ${this.table};
        `
    }
    static createTable() {
        let result = {
            table: this.runMigration('table', 'initial_creation'),
            index: this.runMigration('index', 'initial_creation')
        }
        return result
    }
    static dropTable() {
        let result = {
            table: this.runMigration('dropTable', 'drop_table'),
            index: this.runMigration('dropIndex', 'drop_index')
        }
        return result
    }
    static runMigration(type, action) {
        let migrationLog = fs.createWriteStream('migrations.log', {flags: 'a'});
        let sql = this[type + 'Sql']()
        // DB.execSql(sql)
        // log.info(sql)
        let entry = {
            id: this.table + '-' + type + '-' + action + '-' + new Date().toJSON(),
            type: type,
            name: this.name,
            table: this.table,
            date: new Date().toJSON(),
            sql: sql.replace(/(\r\n|\n|\r)/gm,"").trim(),
        }
        // log.info(entry)
        migrationLog.write(JSON.stringify(entry) + ',\n')
        migrationLog.on('error', (err) => log.err(err))
        migrationLog.close()
        return entry
    }
}

module.exports = BaseModel