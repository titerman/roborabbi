const dotenv = require('dotenv');
const Discord = require('discord.js');
const https = require('https');
const http = require('http');
const moment = require('moment');

const envariables = dotenv.config();
const envs = envariables.parsed;

const client = new Discord.Client();

const CALENDAR_URL = 'https://www.sefaria.org/api/calendars?timezone=Asia/Jerusalem';
const HEBCAL_URL = 'https://www.hebcal.com/shabbat/?cfg=json';
const GEONAMES_URL = 'http://api.geonames.org/searchJSON?q=';
const SEARCH_URL = 'https://www.sefaria.org';

const searchSefaria = (query, msg) => {
    const REQUEST_URL = `${SEARCH_URL}/${query}`;
    https.get(REQUEST_URL, (resp) => {
        resp.on('end', () => {
            if (resp.headers.location) {
                msg.channel.send(`${query} ${SEARCH_URL}${resp.headers.location}`);
                return;
            }
        });
    }).on('error', (err) => {
        console.log(`Error: ${err.message}`);
    });
};

const findZmanim = (arr, msg, city) => {
    let message = `Shabbos zmanim for ${city}.`;
    arr.find((post, index) => {
        switch (post.category) {
        case 'candles':
            message = `${message} ${arr[index].title} on ${moment(arr[index].date).format('dddd, MMMM Do')}.`;
            break;
        case 'havdalah':
            message = `${message} ${arr[index].title}.`;
            break;
        }
    });
    msg.channel.send(message);
};

const requestZmanim = (geoid, onSuccess, msg) => {
    const REQUEST_URL = `${HEBCAL_URL}&geonameid=${geoid}&m=50`;
    https.get(REQUEST_URL, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            const results = JSON.parse(data);
            if (results.error) {
                msg.reply("Couldn't find your city on Hebcal.com. Try expading your query (e.g. adding the name of the state).");
            } else {
                onSuccess(results.items, msg, results.title);
            }
        });
    }).on('error', (err) => {
        console.log(`Error: ${err.message}`);
    });

};

const cityLookup = (city, onSuccess, furtherAction, msg) => {
    const REQUEST_URL = `${GEONAMES_URL}${city}&username=${envs.GEONAMES_USERNAME}`;
    http.get(REQUEST_URL, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            const results = JSON.parse(data).geonames[0];
            if (results) {
                const geoid = results.geonameId;
                onSuccess(geoid, furtherAction, msg);
            } else {
                msg.reply("Couldn't find your city in the Geonames database. Either it's very tiny or you made a typo.");
            }
        });
    }).on('error', (err) => {
        console.log(`Error: ${err.message}`);
    });

};

const loadZmanim = (city, msg) => {
    cityLookup(city, requestZmanim, findZmanim, msg);
};


const loadCalendar = (onSuccess, msg) => {
    https.get(CALENDAR_URL, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            onSuccess(JSON.parse(data).calendar_items, msg);
        });
    }).on('error', (err) => {
        console.log(`Error: ${err.message}`);
    });

};

const loadParsha = (calendar, msg) => {
    const[parsha] = calendar;
    msg.channel.send(`This week's parsha is ${parsha.displayValue.en} (${parsha.ref}) https://sefaria.org/${parsha.url}`);
};

const loadHaftarah = (calendar, msg) => {
    const haftarah = calendar[1];
    msg.channel.send(`This week's haftarah is  ${haftarah.displayValue.en} https://sefaria.org/${haftarah.url}`);
};

const loadDaf = (calendar, msg) => {
    const daf = calendar[2];
    msg.channel.send(`Today's daf is ${daf.displayValue.en} https://sefaria.org/${daf.url}`);
};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === 'ping') {
        msg.reply('pong');
    } 
    else if (msg.content.match(/^!parsha.*/g)) {
        loadCalendar(loadParsha, msg);
    } 
    else if (msg.content.match(/^!daf.*/g)) {
        loadCalendar(loadDaf, msg);
    } 
    else if (msg.content.match(/^!haftarah.*/g)) {
        loadCalendar(loadHaftarah, msg);
    } 
    else if (msg.content.match(/^!shkia.*/g) || msg.content.match(/^!zmanim.*/g) || msg.content.match(/^!candles.*/g) ) {
        const city = msg.content.split(' ').slice(1).join(' ');
        if (city) {
            loadZmanim(city, msg);
        } else {
            loadZmanim ('Jerusalem', msg);
        }
    } 
    else if (msg.content.match(/.*\[.*\]/g)) {
        const matches = msg.content.match(/\[(.*?)\]/g);
        matches.forEach(element => searchSefaria(element.substr(1, element.length - 2), msg));
    }
});

client.login(envs.BOT_KEY);