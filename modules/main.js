const express = require("express");
const app = express({ xPoweredBy: false });
const fs = require("fs");

app.set("view engine", "ejs");
app.set("views", "templates");

app.use(require("./setting"));

app.get("/home", (req, res, next) => {
  res.render("home", { user: req.session.user });
});
app.get("/mypage", (req, res, next) => {
  if (req.session.user.role !== "user") res.redirect("/home");
  else res.render("mypage", { user: req.session.user });
});
app.get("/admin", (req, res, next) => {
  if (req.session.user.role !== "admin") res.redirect("/home");
  else res.render("admin", { user: req.session.user });
});
app.get("/signup", (req, res, next) => {
  res.render("signup", { id: "", pw: "" });
});
app.get("/login", (req, res, next) => {
  if (req.session.user) res.redirect("/home");
  else res.render("login");
});
app.post("/login", async (req, res, next) => {
  if (req.session.user) res.redirect("/home");
  else if (!(req.body.id && req.body.pw)) res.redirect("/login");
  else {
    try {
      // find 는 여러개를 검색
      let user = await req.mongo.User.findOne({
        id: req.body.id,
        pw: req.body.pw,
      });

      // findById - id로 검색
      // req.mongo.User.updateOne, updateMany
      // updateOne or updateMany({key:value},{key:value})
      // 검색값 이후 수정값
      // deleteOne or deleteMany({key:value})
      // 검색값
      // countDocuments({key:value}) - 개수검색

      req.session.user = { id: user.id };
      res.redirect("/home");
    } catch (e) {
      res.render("login", { id: req.body.id, pw: req.body.pw });
    }
  }
});
app.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {});
  res.redirect("/home");
  // req.session.destroy(err=>{});
  // req.session.regenerate(err=>{});
  // req.session.reload(err=>{});

  // req.session; -> 메서드
  // delete req.session.user;
});
app.post("/signout", async (req, res, next) => {
  if (!req.session.user) res.redirect("/home");
  else if (req.session.user.role === "admin") res.redirect("/home");
  else {
    let user = await req.mongo.User.findOne({ id: req.session.user.id });

    user.deleteOne();

    req.session.destroy((err) => {});
    res.redirect("/home");
  }
});
app.post("/signup", async (req, res, next) => {
  if (req.session.user) res.redirect("/home");
  else if (!(req.body.id && req.body.pw)) res.redirect("/home");
  else {
    // mongoose 사용 방법 2가지
    // 1. Model Class 자체 메서드 이용
    // 2. new Model() 로 생성된 인스턴스 메서드 이용

    // req.mongo.User.create(instance, instance)

    let user = new req.mongo.User({
      id: req.body.id,
      pw: req.body.pw,
      gender: "man",
      age: 50,
      signupdate: Date.now(),
    }); // 한개의 클래스
    // save, updateOne, deleteOne
    try {
      let result = await user.save();
      console.log(result);
      req.session.user = { id: result.id };
      res.redirect("/home");
    } catch (e) {
      res.render("signup", { id: req.body.id, pw: req.body.pw });
    }
  }
});

module.exports = app;
