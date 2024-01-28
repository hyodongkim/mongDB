const express = require("express");
require("dotenv").config({ path: "config/.env" });
const router = express.Router();
const session = require("express-session");
const redis = require("redis"); // ES6
const connectRedis = require("connect-redis").default; // ES6 -> export default ~;
const client = redis.createClient({
  url: process.env.REDIS_URL,
});
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  user: process.env.MONGO_ID,
  pass: process.env.MONGO_PW,
  dbName: process.env.MONGO_DB,
  autoIndex: true, // 식별자 자동 생성 여부
  maxPoolSize: 30,
  minPoolSize: 10,
  socketTimeoutMS: 5000,
  serverSelectionTimeoutMS: 10000,
  heartbeatFrequencyMS: 2000, // 2 ~ 5초
});
client.connect();
const RedisStore = new connectRedis({
  client: client,
  prefix: "ssid:",
  ttl: 86400,
  // disableTTL:true - 만료기한 없음
  scanCount: 100,
});
const RedisStoreLong = new connectRedis({
  client: client,
  prefix: "ssid:",
  ttl: 86400 * 7,
  // disableTTL:true - 만료기한 없음
  scanCount: 100,
});
const { User } = require("./schema");
const mongo = {
  User: mongoose.model("User", User),
};

router.use((req, res, next) => {
  req.redis = client;
  req.mongo = mongo;
  next();
});
router.use(express.json());
router.use(express.raw());
router.use(express.text());
router.use(express.urlencoded({ extended: true }));
router.use((req, res, next) => {
  if (true) {
    session({
      secret: process.env.COOKIE_SECRET,
      resave: true,
      saveUninitialized: true,
      rolling: true,
      cookie: {
        maxAge: 1000 * 86400,
        httpOnly: true,
        secure: false,
      },
      store: RedisStore,
    })(req, res, next);
  } else {
    session({
      secret: process.env.COOKIE_SECRET,
      resave: true,
      saveUninitialized: true,
      rolling: true,
      cookie: {
        maxAge: 1000 * 86400 * 7,
        httpOnly: true,
        secure: false,
        // secure: -> https 여부
      },
      // genid: -> 함수
      store: RedisStoreLong,
    })(req, res, next);
  }
});
// router.use(require('cookie-parser')(process.env.COOKIE_SECRET));
// router.use((req,res,next)=>{
//     res.setCookie = (key, value, age)=>{
//         res.cookie(key, value, {
//             path:'/',
//             domain:req.domain,
//             secure: false,
//             httpOnly: false,
//             signed: true,
//             maxAge: age
//         });
//     };
//     res.removeCookie = (key)=>{
//         res.clearCookie(key,  {
//             path:'/',
//             domain:req.domain,
//             secure: false,
//             httpOnly: false,
//             signed: true
//         });
//     };
//     res.removeAllCookie = ()=>{
//         for(let key in req.signedCookies){
//             res.clearCookie(key, {
//                 path:'/',
//                 domain:req.domain,
//                 secure: false,
//                 httpOnly: false,
//                 signed: true
//             });
//         }
//     };
//     req.totalCookies = {...req.cookies, ...req.signedCookies};
//     next();
// });
router.use(
  require("cors")({
    origin: `https://localhost:${process.env.ALLOW_PORT}`,
    methods: ["get", "post", "put", "delete", "patch"],
    allowedHeaders: ["Content-Type"],
    exposedHeaders: ["Content-Type"],
    maxAge: 1000 * 60 * 30,
  })
);
router.use(
  "/resources",
  express.static("resources", {
    dotfiles: "ignore",
    extensions: [],
    fallthrough: true,
    immutable: false,
    maxAge: 18000000,
    index: false,
    redirect: false,
  })
);

module.exports = router;
