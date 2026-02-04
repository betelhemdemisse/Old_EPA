const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination :function(req, file, cb){
    return cb(null, "./public/audio");
  },
  filename: function(req, file, cb){
    return cb(null, `${Date.now()}_${file.originalname}`);
  }
})
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, "../public/audio");
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//       console.log(`Created directory: ${uploadPath}`);
//     }
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     console.log("Processing file:", file.originalname);
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

const fileFilter = (req, file, cb) => {
  console.log("File received:", file.mimetype);
  const allowedTypes = ["audio/mpeg", "audio/wav", "audio/ogg"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Error: File format not supported"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).single("audio"); 

module.exports = upload;
