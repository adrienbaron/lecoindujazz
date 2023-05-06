# Le Coin Du Jazz

This is an online ticket sales website for [Le Coin Du Jazz](https://www.lecoindujazz.com/).

It's using:

- [Remix](https://remix.run/)
- [Tailwind](https://tailwindcss.com/)
- [daisyUI](https://daisyui.com/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)

And is deployed on [Cloudflare Pages](https://pages.cloudflare.com/).

## Development

First install packages:

```sh
npm install
```

Then, initialize the database:
```sh
npx wrangler d1 execute lecoindujazz-dev --file=./drizzle/0000_normal_lady_deathstrike.sql
npx wrangler d1 execute lecoindujazz-dev --file=./drizzle/0001_confused_green_goblin.sql
```
 
Copy the `.env.example` file and fill up the values with something meaningful. You only need to fill up Stripe ones if you want to test buying tickets.

Then build the app once:
```sh
npm run build
```

Finally, start the remix dev server and wrangler
```sh
npm run dev
```

Open up [http://127.0.0.1:8788](http://127.0.0.1:8788) and you should be ready to go 🥳!
