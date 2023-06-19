const fs = require('fs')
const dotenv = require("dotenv");
dotenv.config({ path: "./.config.env" })
const Sequelize = require("sequelize")
var profileDir = './images/profile'
const dirs = [profileDir]

// creating the db instance
const sampledb = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    logging: false,
    define: {
        underscored: true, // use snake_case for all fields in the database
        // freezeTableName: true, //stop the auto-pluralization performed by Sequelize
        timestamps: false // don't add timestamps to tables by default (createdAt, updatedAt)
    },
})

const { Role, User } = require("../models/sampledb")(sampledb, Sequelize)

sampledb.authenticate()
    .then(() => console.log(`connected to ${sampledb.config.database} successfully!`))
    .catch(err => console.log(`unable to connect ${sampledb.config.database}!`, err.message))
sampledb.sync({ force: true })
    .then(() => seedDB())
    .catch(err => console.log(`unable to sync ${sampledb.config.database}!`, err.message))

const seedDB = async () => {
    try {
        for (let dir of dirs) {
            createDirIfNotExists(dir)
        }
        const roles = JSON.parse(fs.readFileSync(`${__dirname}/roles.json`, 'utf-8'))
        await Role.destroy({ truncate: { cascade: true } })
        await Role.bulkCreate(roles)

        const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
        await User.destroy({ truncate: { cascade: true } })
        const allusers = users.map(async (user) => {
            return await User.create(user)
        })
        await Promise.all(allusers)

        console.log('Data seeded successfully!')
    }
    catch (err) {
        console.log(err)
    }
    finally {
        sampledb.close()
        process.exit()
    }
}

const createDirIfNotExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return;
}