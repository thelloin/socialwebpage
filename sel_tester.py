# python -m SimpleHTTPServer 8000
#!/usr/bin/env python
#-*- coding: utf-8 -*-

import unittest

import time

from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait # available since 2.4.0
from selenium.webdriver.common.keys import Keys

class SocializeTests(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        

    def test_A_register(self):
        driver = self.driver
        driver.get("localhost:3000/#/register")


        """ Testing to registrate a user
        When a registration is successful, the user is automatically logged in """
        firstNameInputField = driver.find_element_by_id("firstName")
        firstNameInputField.send_keys("testUserFirstName")
        lastNameInputField = driver.find_element_by_id("Text1")
        lastNameInputField.send_keys("testUserLastName")
        userNameInputField = driver.find_element_by_id("username")
        userNameInputField.send_keys("testUserName")
        passwordInputField = driver.find_element_by_id("password")
        passwordInputField.send_keys("testPassword")
        time.sleep(0.5)
        # Find the register-button
        registerButton = driver.find_element_by_class_name("button")
        registerButton.click()
        time.sleep(0.5)
        # Check so we came to the home page
        self.assertEqual("home" in driver.current_url, True)

        """ Testing register a user with a already used username """
        # Start by logging out testUserName
        logout = driver.find_element_by_link_text("Log out")
        logout.send_keys(Keys.ENTER)
        time.sleep(0.5)
        # Go to registration page
        driver.find_element_by_link_text("Register").send_keys(Keys.ENTER)
        # Fill out the form, with the same user info
        firstNameInputField = driver.find_element_by_id("firstName")
        firstNameInputField.send_keys("testUserFirstName")
        lastNameInputField = driver.find_element_by_id("Text1")
        lastNameInputField.send_keys("testUserLastName")
        userNameInputField = driver.find_element_by_id("username")
        userNameInputField.send_keys("testUserName")
        passwordInputField = driver.find_element_by_id("password")
        passwordInputField.send_keys("testPassword")
        time.sleep(0.5)
        # Find the register-button
        registerButton = driver.find_element_by_class_name("button")
        registerButton.click()
        time.sleep(0.5)
        # Check so we didn't came to the home page
        self.assertNotEqual("home" in driver.current_url, True)
        # Check so error message is displayed
        bodyText = driver.find_element_by_tag_name('body').text
        self.assertEqual("Registration failed." in bodyText, True)
        time.sleep(0.5)

    def test_B_login(self):
        driver = self.driver

        driver.get("localhost:3000/#/login")

        time.sleep(0.5)

        """ Testing to log in with a user which username is not registred """
        userNameInputField = driver.find_element_by_id("username")
        userNameInputField.send_keys("testNotReggedUser")
        passwordInputField = driver.find_element_by_id("password")
        passwordInputField.send_keys("testPassword")
        time.sleep(0.5)
        loginButton = driver.find_element_by_class_name('button')
        loginButton.click()
        time.sleep(0.5)

        # Authentication should fail here
        # Check so we didn't came to the home page
        self.assertNotEqual("home" in driver.current_url, True)
        bodyText = driver.find_element_by_tag_name('body').text
        # Check that error message is displayed
        self.assertEqual("Authentication failed!" in bodyText, True)


        """ Testing to log in with correct username but wrong password """
        userNameInputField.clear()
        userNameInputField.send_keys("testUserName")
        passwordInputField.clear()
        passwordInputField.send_keys("testWrongPassword")
        time.sleep(0.5)
        loginButton.click()
        time.sleep(0.5)

        # Authentication should fail here
        # Check so we didn't came to the home page
        self.assertNotEqual("home" in driver.current_url, True)
        bodyText = driver.find_element_by_tag_name('body').text
        # Check that error message is displayed
        self.assertEqual("Authentication failed!" in bodyText, True)

        """ Testing to log in with correct username and password """
        userNameInputField.clear()
        userNameInputField.send_keys("testUserName")
        passwordInputField.clear()
        passwordInputField.send_keys("testPassword")
        time.sleep(0.5)
        loginButton.click()
        time.sleep(0.5)

        # Authentication should be successful
        # Check so we came to the home page
        self.assertEqual("home" in driver.current_url, True)
        bodyText = driver.find_element_by_tag_name('body').text
        # Check that no error message is displayed
        self.assertNotEqual("Authentication failed!" in bodyText, True)

       

    def test_C_adding_friends(self):
        driver = self.driver
        driver.get("localhost:3000/#/register")

        """ First we register two dummy testUsers so our primary testUser can add theese as friends """
        firstNameInputField = driver.find_element_by_id("firstName")
        firstNameInputField.send_keys("Bruce")
        lastNameInputField = driver.find_element_by_id("Text1")
        lastNameInputField.send_keys("Wayne")
        userNameInputField = driver.find_element_by_id("username")
        userNameInputField.send_keys("batman")
        passwordInputField = driver.find_element_by_id("password")
        passwordInputField.send_keys("batman")
        time.sleep(0.5)
        # Find the register-button
        registerButton = driver.find_element_by_class_name("button")
        registerButton.click()
        time.sleep(0.5)

        # Add our test user as a friend for later testing
        driver.find_element_by_tag_name('input').send_keys('testUserFirstName testUserLastName')
        driver.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        time.sleep(0.5)
        searchButton = driver.find_element_by_link_text('Go')
        searchButton.click()
        time.sleep(0.5)

        # Go to testUser page
        driver.find_element_by_link_text('testUserFirstName testUserLastName').send_keys(Keys.ENTER)
        time.sleep(0.5)
        # Add testUser as friend
        addFriendButton = driver.find_element_by_xpath("//button[contains(text(), 'Add testUserFirstName testUserLastName')]")
        addFriendButton.click()
        time.sleep(0.5)


        # Log out batman
        logout = driver.find_element_by_link_text("Log out")
        logout.send_keys(Keys.ENTER)
        time.sleep(0.5)

        driver.find_element_by_link_text("Register").send_keys(Keys.ENTER)
        firstNameInputField = driver.find_element_by_id("firstName")
        firstNameInputField.send_keys("Clark")
        lastNameInputField = driver.find_element_by_id("Text1")
        lastNameInputField.send_keys("Kent")
        userNameInputField = driver.find_element_by_id("username")
        userNameInputField.send_keys("superman")
        passwordInputField = driver.find_element_by_id("password")
        passwordInputField.send_keys("superman")
        time.sleep(0.5)
        # Find the register-button
        driver.find_element_by_class_name("button").click()
        time.sleep(0.5)
        # Log out superman
        logout = driver.find_element_by_link_text("Log out")
        logout.send_keys(Keys.ENTER)
        time.sleep(0.5)

        # Log in with our testUser
        userNameInputField = driver.find_element_by_id("username")
        userNameInputField.send_keys("testUserName")
        passwordInputField = driver.find_element_by_id("password")
        passwordInputField.send_keys("testPassword")
        time.sleep(0.5)
        driver.find_element_by_class_name('button').click()
        time.sleep(0.5)

        """ Adding Bruce Wayne as our friend """
        # Search for Bruce Wayne
        driver.find_element_by_tag_name('input').send_keys('Bruce Wayne')
        driver.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        time.sleep(0.5)
        searchButton = driver.find_element_by_link_text('Go')
        searchButton.click()
        time.sleep(0.5)

        # Go to Bruce Waynes page
        driver.find_element_by_link_text('Bruce Wayne').send_keys(Keys.ENTER)
        # Check so we cant post a message because we are not friends
        writePostButtons = driver.find_elements_by_xpath("//button[contains(text(), 'Write Post')]")
        time.sleep(0.5)
        self.assertEqual(len(writePostButtons), 0)

        # Add Bruce Wayne as friend
        addFriendButton = driver.find_element_by_xpath("//button[contains(text(), 'Add Bruce Wayne')]")
        addFriendButton.click()
        time.sleep(0.5)

        """ Adding Clark Kent as our friend """
        driver.find_element_by_link_text("Socialize").click()
        driver.find_element_by_tag_name('input').send_keys('Clark Kent')
        driver.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        time.sleep(0.5)
        searchButton = driver.find_element_by_link_text('Go')
        searchButton.click()
        time.sleep(0.5)

        # Go to Clark Kent page
        driver.find_element_by_link_text('Clark Kent').send_keys(Keys.ENTER)
        # Check so we cant post a message because we are not friends
        writePostButtons = driver.find_elements_by_xpath("//button[contains(text(), 'Write Post')]")
        time.sleep(0.5)
        self.assertEqual(len(writePostButtons), 0)

        # Add Clark Kent as friend
        addFriendButton = driver.find_element_by_xpath("//button[contains(text(), 'Add Clark Kent')]")
        addFriendButton.click()
        time.sleep(0.5)

        # Go to our home page and check if we have Clark and Bruce as friends in our friend list
        driver.find_element_by_link_text("Socialize").click()
        time.sleep(0.5)
        driver.find_element_by_class_name("right-off-canvas-toggle").click()

        friend = []
        friends = driver.find_elements_by_xpath("//li[@ng-repeat='f in friends']")
        self.assertEqual(friends[0].text, 'Bruce Wayne')
        self.assertEqual(friends[1].text, 'Clark Kent')

        time.sleep(0.5)


    def test_D_posts(self):
        driver = self.driver
        driver.get("localhost:3000/#/login")

        # Log in with our testUser
        userNameInputField = driver.find_element_by_id("username")
        userNameInputField.send_keys("testUserName")
        passwordInputField = driver.find_element_by_id("password")
        passwordInputField.send_keys("testPassword")
        time.sleep(0.5)
        driver.find_element_by_class_name('button').click()
        time.sleep(0.5)

        # Go to Bruce Waynes page
        driver.find_element_by_class_name("right-off-canvas-toggle").click()
        time.sleep(0.5)
        driver.find_element_by_link_text('Bruce Wayne').send_keys(Keys.ENTER)
        time.sleep(0.5)
    
        writePostButton = driver.find_element_by_xpath("//button[contains(text(), 'Write post')]")
        writePostButton.click()
        time.sleep(0.5)
        driver.find_element_by_tag_name('textarea').send_keys("Hi Bruce! Nice crime-fighting skills you showed last night!!")
        time.sleep(0.5)
        driver.find_element_by_xpath("//button[contains(text(), 'Send')]").click()
        time.sleep(0.5)
        bodyText = driver.find_element_by_tag_name('body').text
        # Check that the post appeared on the page
        self.assertEqual("Hi Bruce! Nice crime-fighting skills you showed last night!!" in bodyText, True)


    def test_E_upload_images(self):
        driver = self.driver
        driver.get("localhost:3000/#/login")

        # Log in with our testUser
        userNameInputField = driver.find_element_by_id("username")
        userNameInputField.send_keys("testUserName")
        passwordInputField = driver.find_element_by_id("password")
        passwordInputField.send_keys("testPassword")
        time.sleep(0.5)
        driver.find_element_by_class_name('button').click()
        #loginButton.click()
        time.sleep(0.5)

        driver.find_element_by_link_text('Images').click()
        time.sleep(0.5)
        driver.find_element_by_xpath("//button[contains(text(), 'Upload picture')]").click()
        time.sleep(0.5)
        driver.find_element_by_css_selector("input[type=\"file\"]").send_keys("/home/tommy/kurser/tdp013/tdp013_projekt/testimage1.png")
        time.sleep(0.5)
        driver.find_element_by_id("sendImage").click()
        # Wait 4 seconds to make sure that we see the image
        time.sleep(4)
        # Check if the picture shows in the browser
        images = []
        images = driver.find_elements_by_id("imageDiv")
        self.assertEqual(len(images), 1)
        time.sleep(0.5)

        # Upload another picture
        driver.find_element_by_css_selector("input[type=\"file\"]").send_keys("/home/tommy/kurser/tdp013/tdp013_projekt/testimage2.png")
        time.sleep(0.5)
        driver.find_element_by_id("sendImage").click()
        # Wait 4 seconds to make sure that we see the image
        time.sleep(4)
        # Check if the picture shows in the browser
        images = driver.find_elements_by_id("imageDiv")
        self.assertEqual(len(images), 2)
        time.sleep(0.5)
        


    def tearDown(self):
        self.driver.close()
        #self.driver2.close()

if __name__ == "__main__":
    unittest.main()
