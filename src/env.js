const env = process.env.NODE_ENV
const IS_DEV = env && env.trim() === 'development'

module.exports = {
  env,
  IS_DEV
}
