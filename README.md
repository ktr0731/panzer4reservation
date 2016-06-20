Panzer 4 Reservation
====

![GIRLS & PANZER der FILM](./gup.jpg)

A reservation script for GIRLS & PANZER der FILM.  

## Description  
In cinemacity in Tachikawa city, Tokyo, that theater is showing GIRLS & PANZER der FILM with a roar.  
A lot of people says, "Garupan ha iizo.". It means, "GIRLS & PANZER is good.".  
I agree that idea too.  

But, cinemacity is very popular. It is difficult for me get wish seats.  
So, I developed this script.  

This script get reservation for some seats of a request.  
But it is cheap. I can not bear responsibility.  

## Equipments
- JavaScript
- PhantomJS
- CasperJS

## Installation
1. If PhantomJS does not exist, you should install it.  
For OS X:  
``` sh
$ brew install phantomjs
```

2. npm.
``` sh
$ npm install
```

3. Edit config.json.
``` json  
{
  "targetDate" : 22,
  "wishSeats" : [
    [ "C1", "C3" ],
    [ "F17" ],
    [ "G7", "G8"],
    [ "P2", "P21" ]
  ],
  "emails" : [
    "hoge@fuga.co.jp"
  ]
}
```
`wishSeats` is request order. If you can get seats set, then finish check sequence.  
If friends are sinema citizen, please fill emails. Unnesessary your email.  

## License
Please see LICENSE.
