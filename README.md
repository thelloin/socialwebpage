Frontend: HTML5, CSS3, Javascript, AngularJS, Foundation. (Använder bl.a. socketio, webworkers, form validation, någorlunda responsiv design. Fokus på funktionalitet)
Backend: NodeJS/Express.
DB: MongoDb, Mongoose used for MongoDb object modeling.
Testing done with selenium, mocha and istanbul.
Editor/IDE: emacs

Make sure you have a mongodb server running on port 27017 before running app.js with node.

Selenium:
When tests are run, make sure to run 'sel_tester.py' before running 'sel_test_chat.py' for the tests to work. The reason for having two files is that we didn't find a way to start two browser in unittest and therefore had to run those tests outside of 'sel_tester.py'.

For the tests to work the path to the images has to be changed when doing file upload test.

If the tests are run several times, make sure to clear the db of the testusers createt by the tests for the tests to work correctly.