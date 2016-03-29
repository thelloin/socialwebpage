#!/usr/bin/python
# -*- coding: utf-8 -*-

""" This file is used to test chat-functionality for our home page
    
    The reason for having this code in a separate file is because
    we couldn't found a solution for opening two browsers at the
    same time when using unittest for our testings.

    The tests in this file depends on the registrations of users
    done in sel_tester.py
"""

from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait # available since 2.4.0
import time
from selenium.webdriver.common.keys import Keys

sleepTimer = 0.5

# Create a new instance of the Firefox driver
driver2 = webdriver.Firefox()
driver1 = webdriver.Firefox()

# Go to home page
driver1.get("localhost:3000")
driver2.get("localhost:3000")

def login(username, password, driver):
    driver.find_element_by_id('username').send_keys(username)
    driver.find_element_by_id('password').send_keys(password)
    driver.find_element_by_class_name('button').click()
    time.sleep(0.5)

def startChat(friend, driver):
    driver.find_element_by_class_name("right-off-canvas-toggle").click()
    time.sleep(1)
    friend_element = driver.find_element_by_link_text(friend)
    friend_element.find_element_by_xpath('//i').click()
    time.sleep(0.5)

    temp_string = "//button[contains(text(), '" + friend + "')]" 
    driver.find_element_by_xpath(temp_string).click()
    time.sleep(0.5)

def sendChatMessage(message, driver):
    driver.find_element_by_xpath("//input[@id='chatInput']").send_keys(message)
    time.sleep(0.5)
    driver.execute_script("document.querySelectorAll('button#sendChatButton')[0].click()")
    time.sleep(0.5)
    

def addFriend(friend, driver):
    driver.find_element_by_tag_name('input').send_keys(friend)
    driver.find_element_by_tag_name('input').send_keys(Keys.ENTER)
    driver.find_element_by_link_text('Go').click()
    time.sleep(0.5)
    driver.find_element_by_link_text(friend).send_keys(Keys.ENTER)
    tempString = "//button[contains(text(), 'Add " + friend + "')]"
    driver.find_element_by_xpath(tempString).click()
    #driver.find_element_by_xpath("//button[contains(text(), 'Add Bruce Wayne')]").click()
    time.sleep(0.5)
    driver.find_element_by_link_text("Socialize").click()
    time.sleep(0.5)

time.sleep(0.5)
login('testUserName', 'testPassword', driver1)
startChat('Bruce Wayne', driver1)

login('batman', 'batman', driver2)
startChat('testUserFirstName testUserLastName', driver2)

sendChatMessage('Hi there batman', driver1)

# Check so that batman got the message
bodyText = driver2.find_element_by_tag_name('body').text
check = 'Hi there batman' in bodyText
assert check == True


time.sleep(3)

driver1.quit()
driver2.quit()
