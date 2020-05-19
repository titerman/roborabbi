# Roborabbi

Jewish Discord bot

**Requirements:**
* [Discord.js](https://github.com/discordjs/discord.js) for obvious reasons
* [Dotenv](https://github.com/motdotla/dotenv) to enable project-specific environment variables
* [Moment.js](https://github.com/moment/moment/) for human-friendly date formatting

**Installation:**
* Create a new Discord bot [here](https://discord.com/developers/applications) 
* Set the `BOT_TOKEN` environment variable
* Create a Geonames.com user account
* Set the `GEONAMES_USERNAME` environment variable
* `node i`
* `npm start`

**Commands:**
* `!parsha` returns this week's parsha
* `!haftarah` returns this week's haftarah
* `!daf` returns today's daf
* `!shkiah` or `!zmanim` followed by the city name return Shabbat times for that city
* Referencing a source in square brackets (ex: `[Sotah 49b:19]`) returns a Sefaria link to the text (if possible)

### License: [MIT](LICENSE)