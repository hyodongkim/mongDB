const mongoose = require('mongoose');

// 자료형 종류
// String - 문자열
// Number - 숫자
// Date - 날짜
// Buffer - 이진 정보 또는 이미지 또는 파일
// Boolean - 논리
// Schema.Types.Mixed - 아무거나
// Schema.Types.ObjectId - Join 연결
    // 단, 이때는 ref라는 옵션 필수(모델명)

const User = mongoose.Schema({
    "id":{
        "type":String,
        "required":true, // 필수 여부
        "unique":true // 중복 거부 여부
    },
    "pw":{
        "type":String,
        "required":true,
        "match":/^[a-zA-Z\\d`~!@#$%^&*()-_=+]{8,24}$/ ,// 정규표현식
        // "validate":{
        //     "validator":(data)=>{return false;},
        //     "message": "조건이 잘못되었음"
        // }
    },
    "email":{
        "type":String,
        "default":"a@a.com" // 기본값
    },
    "gender":{
        "type":String,
        "enum":["man","woman"] // 이중 한개
    },
    "age":{
        "type":Number,
        "min":0, // 최소
        "max":100 // 최대
    },
    "signupdate":{
        "type":Date
    }
    // "boards":[
    //     {"data":String}
    // ]
});

module.exports = {User};