const twitter_credentials = require('./twitter-api-credentials');
const Twitter = require('twitter');
const MarkovChain = require('markovchain')

let twitter = new Twitter(twitter_credentials);

var wordList = "";

exports.tweet = function(event, context) {
  twitter.get(
    'statuses/user_timeline',
    {
      screen_name: "realDonaldTrump",
      count: 200,
      exclude_replies: true,
      include_rts: false,
      tweet_mode: 'extended'
    },
    function(error, tweets, response) {
      if (!error) {
        for (var i = 0; i < tweets.length; i++) {
          wordList += " ";
          wordList += tweets[i].full_text;
          wordList = wordList.replace(/[, ]+/g, " ").trim();
          wordList.replace(/http\S+/, '');
          wordList.replace(/,/, '');
        }
        var markovChain = new MarkovChain(wordList);
        jaredTweet(markovChain);
      }
    }
  )
}

function jaredTweet(chain) {
  twitter.post(
    'statuses/update',
    {
      status: chain.start(useUpperCase).end().process()
    },
    function(error, tweet, response) {
      if (error) {
        console.log(error);
        jaredTweet()
      }
    }
  )
}

var useUpperCase = function(wordList) {
  var tmpList = Object.keys(wordList).filter(function(word) {
    return word[0] >= 'A' && word[0] <= 'Z'
  })
  return tmpList[~~(Math.random()*tmpList.length)]
}