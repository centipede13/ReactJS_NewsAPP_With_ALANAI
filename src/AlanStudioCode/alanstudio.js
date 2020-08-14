intent('What does this app do?', 'What can I do here?', reply('This is a news project.'));

const key = ''; // Enter your NewsAPI KEY
let savedArticles =[];

// News by Source
intent('Give me the news from $(source* (.*))', (p) => {
    let newsUrl = `https://newsapi.org/v2/top-headlines?apiKey=${key}`;
    
    if(p.source.value) {
        newsUrl = `${newsUrl}&sources=${p.source.value.toLowerCase().split(" ").join('-')}`
    }
    
    api.request(newsUrl, (error, response, body) => {
        const { articles } = JSON.parse(body);
        
        if(!articles.length) {
            p.play('Sorry, please try searching for news from a different source');
            return;
        }
        
        savedArticles = articles;
        
        p.play({ command: 'newHeadlines', articles });
        p.play(`Here are the (latest|recent) ${p.source.value}.`);
        
        p.play('Would you like me to read the headlines?');
        p.then(confirmation);
        
    });
});

// News by Term
intent('Whats\'s up with $(term* (.*))', (p) => {
    let newsUrl = `https://newsapi.org/v2/everything?apiKey=${key}`;
    
    if(p.term.value) {
        newsUrl = `${newsUrl}&q=${p.term.value}`
    }
    
    api.request(newsUrl, (error, response, body) => {
        const { articles } = JSON.parse(body);
        
        if(!articles.length) {
            p.play('Sorry, please try searching for something else.');
            return;
        }
        
        savedArticles = articles;
        
        p.play({ command: 'newHeadlines', articles });
        p.play(`Here are the (latest|recent) articles on ${p.term.value}.`);
        
        p.play('Would you like me to read the headlines?');
        p.then(confirmation);
        
    });
});

// News by Categories
const CATEGORIES = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
const CATEGORIES_INTENT = `${CATEGORIES.map((category) => `${category}~${category}`).join('|')}|`;

intent(`(show|what is|tell me|what's|what are|what're|read) (the|) (recent|latest|) $(N news|headlines) (in|about|on|) $(C~ ${CATEGORIES_INTENT})`,
  `(read|show|get|bring me|give me) (the|) (recent|latest) $(C~ ${CATEGORIES_INTENT}) $(N news|headlines)`, (p) => {
    let newsUrl = `https://newsapi.org/v2/top-headlines?apiKey=${key}&country=in`;
    
    if(p.C.value) {
        newsUrl = `${newsUrl}&category=${p.C.value}`
    }
    
    api.request(newsUrl, (error, response, body) => {
        const { articles } = JSON.parse(body);
        
        if(!articles.length) {
            p.play('Sorry, please try searching for a different category.');
            return;
        }
        
        savedArticles = articles;
        
        p.play({ command: 'newHeadlines', articles });
        if(p.C.value) {
            p.play(`Here are the (latest|recent) articles on ${p.C.value}.`);
        } else {
            p.play(`Here are the (latest|recent) news.`);
        }
        
        p.play('Would you like me to read the headlines?');
        p.then(confirmation);
        
    });
});

const confirmation = context(() => {
    intent('yes', async (p) => {
        for(let i = 0; i< savedArticles.length; i++){
            p.play({ command: 'highlight', article:savedArticles[i]});
            p.play(`${savedArticles[i].title}`);
        }
    })
    intent('no', (p) => {
        p.play('Sure, sound\'s good to me.')
    })
})

intent('open (the|) (article|) (number|) $(number* (.*))', (p) => {
    if(p.number.value) {
        p.play({ command:'open', number: p.number.value, articles: savedArticles})
    }
})
intent('(go|) back', (p) => {
    p.play('Sure, going back');
    p.play({ command: 'newHeadlines', articles: []})
})