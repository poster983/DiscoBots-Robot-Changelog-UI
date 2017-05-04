# DiscoBots-Robot-Changelog-UI for the Vex Robotics Team 2587K

## Requirements:  

* NodeJS  
* A Mongodb Database

## Recommended Deployment  

* For hosting, use [Heroku's](https://www.heroku.com) free plan.
* For database hosting, use [mLab's](https://elements.heroku.com/addons/mongolab) free plan and connect it to your Heroku dyno.

You won't need more than the free plan.  

## Environment Variables(Config Variables)   

There are two Config Variables used:

* `process.env.MONGODB_URI` is for holding your Mongodb URI. If you are using Heroku with the addon, it should automatically add this to the Config Variables. 
* `process.env.COLLECTION` tells the app what collection in the database to connect to. (Ex "dev" and "production")

