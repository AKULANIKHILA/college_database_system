const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.set("view engine", "ejs");
app.set('views', __dirname + "/views");

app.use(bodyParser.json());

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
var serviceAccount = require("./project-db.json");

var urlencodedParser = bodyParser.urlencoded({ extended: false });

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

const IS_EMULATOR = ((typeof process.env.FUNCTIONS_EMULATOR === 'boolean' && process.env.FUNCTIONS_EMULATOR) || process.env.FUNCTIONS_EMULATOR === 'true');

if (IS_EMULATOR) {
    firestore.settings({
        host: "localhost",
        port: "3000",
        ssl: false
    });
}

const
    { FieldValue } = require("firebase-admin/firestore");

var dateTime = require("node-datetime");

app.get("/", function (req, res) {
    res.render("loginform", {});
});

app.post("/dashboard", urlencodedParser, function (req, res) {
    console.log(req.body);
    db.collection("students").where('email', '==', req.body.email).where('pwd', '==', req.body.password).where('role', '==', req.body.role).get().then((docs) => {
        let flag = false;
        let student = {};
        docs.forEach((doc) => {
            student = { email: doc.data().email, pwd: doc.data().pwd, role: doc.data().role };
            flag = true;
        })
        if (flag) {
            console.log(student);
            if (student.role == "admin") {
                res.render("Dashboard_admin", { data: student });
            }
            else {
                res.render("Dashboard1", { data: student });
            }
        }
        else {
            console.log("Invalid Credentials");
            res.render("loginform", {});
        }
    })
});

app.get("/register", function (req, res) {
    res.render("Register");
});

app.post("/studentregister", urlencodedParser, function (req, res) {
    db.collection("students").add({
        rollno: req.body.rollNo,
        email: req.body.email,
        pwd: req.body.password,
        name: req.body.Name,
        year: req.body.year,
        role: req.body.role
    }).then(() => {
        console.log("Student added successfully");
        res.render("loginform", {});
    })
});

app.get("/events", function (req, res) {
    res.render("events", { userRole: req.body.role }); // Assuming 'role' is the user's role
});

app.post("/submit_event", urlencodedParser, function (req, res) {
    // Extract competition data from the request body
    const description = req.body.competitionDescription;
    const links = req.body.competitionLinks.split(',').map(link => link.trim());
    // Validate and store data in Firestore
    if (description && links.length > 0) {
        db.collection("competitions").add({
            description: description,
            links: links

        })
            .then(() => {
                console.log("Competition added successfully");
                res.redirect("/events"); // Redirect to the events page or a success page
            })
            .catch((error) => {
                console.error("Error adding competition:", error);
                res.redirect("/events"); // Redirect to an error page or handle the error
            });
    } else {
        console.log("Invalid competition data");
        res.redirect("/events"); // Redirect to an error page or handle the error
    }
});


app.post("/upload", urlencodedParser, function (req, res) {
    let student = { email: req.body.email, pwd: req.body.pwd, role: req.body.role };
    console.log("student");
    console.log(req.body);
    res.render("UploadProject", { data: student });
});

app.post("/projectSubmit", urlencodedParser, function (req, res) {
    let student = { email: req.body.email1, pwd: req.body.pwd, role: req.body.role };
    db.collection("student_projects").add({
        name: req.body.name,
        rollno: req.body.rollno,
        email: req.body.email,
        dept: req.body.dept,
        year: req.body.year,
        technology: req.body.technology,
        title: req.body.projectTitle,
        gitlink: req.body.googleDriveLink
    }).then(() => {
        console.log("Project details added successfully");
        res.render("Dashboard1", { data: student });
    });
});

app.post("/event_admin", urlencodedParser, function (req, res) {
    res.json(req.body);
});

app.post("/projects", urlencodedParser, function (req, res) {
    let admin = { email: req.body.email, pwd: req.body.pwd, role: req.body.role };
    db.collection("student_projects").get().then((docs) => {
        let projects = []
        docs.forEach((doc) => {
            let project = { name: doc.data().name, rollno: doc.data().rollno, email: doc.data().email, dept: doc.data().dept, year: doc.data().year, technology: doc.data().technology, title: doc.data().title, gitlink: doc.data().gitlink };
            projects.push(project);
        });
        console.log(projects);
        console.log(admin);
        res.render("Projects", { data: projects, admin: admin });
    })
});

app.post("/projects_update", urlencodedParser, function (req, res) {
    let admin = { email: req.body.email, pwd: req.body.pwd, role: req.body.role };
    console.log(req.body.dept);
    console.log(req.body.year);
    if ((req.body.dept != "Select") && (req.body.year != "Select")) {
        db.collection("student_projects").where('dept', '==', req.body.dept).where('year', '==', req.body.year).get().then((docs) => {
            let projects = [];
            docs.forEach((doc) => {
                let project = { name: doc.data().name, rollno: doc.data().rollno, email: doc.data().email, dept: doc.data().dept, year: doc.data().year, technology: doc.data().technology, title: doc.data().title, gitlink: doc.data().gitlink };
                projects.push(project);
            });
            console.log(admin);
            res.render("Projects", { data: projects, admin: admin });
        });
    } else if (req.body.dept != "Select") {
        db.collection("student_projects").where('dept', '==', req.body.dept).get().then((docs) => {
            let projects = [];
            docs.forEach((doc) => {
                let project = { name: doc.data().name, rollno: doc.data().rollno, email: doc.data().email, dept: doc.data().dept, year: doc.data().year, technology: doc.data().technology, title: doc.data().title, gitlink: doc.data().gitlink };
                projects.push(project);
            });
            console.log(admin);
            console.log(projects);
            res.render("Projects", { data: projects, admin: admin });
        });
    } else if (req.body.year != "Select") {
        db.collection("student_projects").where('year', '==', req.body.year).get().then((docs) => {
            let projects = [];
            docs.forEach((doc) => {
                let project = { name: doc.data().name, rollno: doc.data().rollno, email: doc.data().email, dept: doc.data().dept, year: doc.data().year, technology: doc.data().technology, title: doc.data().title, gitlink: doc.data().gitlink };
                projects.push(project);
            });
            console.log(admin);
            res.render("Projects", { data: projects, admin: admin });
        });
    } else {
        let projects = [];
        console.log(admin);
        res.render("Projects", { data: projects, admin: admin });
    }
});

app.post("/upload_admin", urlencodedParser, function (req, res) {
    res.json(req.body);
});

app.post("/adminprofile", urlencodedParser, function (req, res) {
    res.json(req.body);
});

app.post("/notification_admin", urlencodedParser, function (req, res) {
    res.json(req.body);
});

app.post("/studentprofile", urlencodedParser, function (req, res) {
    let student = { email: req.body.email, pwd: req.body.pwd, role: req.body.role };
    db.collection("students").where('email', '==', req.body.email).where('pwd', '==', req.body.pwd).where('role', '==', req.body.role).get().then((docs) => {
        docs.forEach((doc) => {
            db.collection("student_projects").where('rollno', '==', doc.data().rollno).get().then((docs1) => {
                let projects = [];
                docs1.forEach((doc1) => {
                    let project = { name: doc1.data().name, rollno: doc1.data().rollno, email: doc1.data().email, dept: doc1.data().dept, year: doc1.data().year, technology: doc1.data().technology, title: doc1.data().title, gitlink: doc1.data().gitlink };
                    projects.push(project);
                });
                res.render("StudentProfile", { data: projects, student: student });
            });
        });
    });
});

app.post("/editproject", urlencodedParser, function (req, res) {
    let student = { email: req.body.email, pwd: req.body.pwd, role: req.body.role };
    db.collection("student_projects").where('rollno', '==', req.body.rollno).where('gitlink', '==', req.body.gitlink).get().then((docs1) => {
        let projects = [];
        docs1.forEach((doc1) => {
            let project = { name: doc1.data().name, rollno: doc1.data().rollno, email: doc1.data().email, dept: doc1.data().dept, year: doc1.data().year, technology: doc1.data().technology, title: doc1.data().title, gitlink: doc1.data().gitlink };
            projects.push(project);
        });
        res.render("EditProject", { data: projects, student: student });
    });
});

app.post("/updateproject", urlencodedParser, function (req, res) {
    let student = { email: req.body.email, pwd: req.body.pwd, role: req.body.role };
    db.collection("student_projects").where('rollno', '==', req.body.prollno).where('gitlink', '==', req.body.pgitlink).get().then((docs) => {
        docs.forEach((doc) => {
            db.collection("student_projects").doc(doc.id).update({
                name: req.body.name,
                rollno: req.body.rollno,
                technology: req.body.technology,
                title: req.body.title,
                gitlink: req.body.gitlink
            });
        });
        res.render("Dashboard1", { data: student });
    });
});

app.post("/events_admin", urlencodedParser, function (req, res) {
    let userRole = { email: req.body.email, pwd: req.body.pwd, role: req.body.role };
    db.collection('competitions').get().then((docs) => {
        let events = [];
        docs.forEach((doc) => {
            let event = { description: doc.data().description, link: doc.data().link };
            events.push(event);
        });
        console.log(events);
        console.log(userRole);
        res.render("Events_Admin", { data: events, userRole: userRole }); // Assuming you have an Events_Admin view
    });
});


app.post("/notification_student", urlencodedParser, function (req, res) {
    res.json(req.body);
});

app.get("/forgot", function (req, res) {
    res.json("Forgot");
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});