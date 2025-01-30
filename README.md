# Quick start
1) Run ```npm i``` to install dependencies and Next.js. You may need to run ```npm run i --force``` due the newest version of Next.js not being 100% compatible with the other dependencies.
2) Run ```npm run dev``` to start the local server
3) Access ```localhost:3000``` in your browser

~~# Dependencies
npm install -g pnpm
pnpm i shadcn@latest init~~

## Library Selection
Of the main charting libraries, we chose recharts due to its rising popularity and compatibility with react frameworks and specifically, nextjs. Recharts is also a living project with the most recent update just over a month ago compated to others (apart from chart.js) which recieved updated between five months and two years ago. We personally were not pleased with the default theming of recharts but after research, we found a collection called Shadcn/UI (https://ui.shadcn.com/docs). This is a libary of code containing themes for each of the components making the charts look much more modern. As a plus, it is not a dependency but rather an online library to reuse code in projects for free with no licensing required. (NOTE, SHADCN UI ALSO HAS AN NPM PACKAGE WITH CUSTOM COMPONENTS, KINDA FIRE. CONS; no longer super-light weight)

https://npmtrends.com/chart.js-vs-echarts-vs-react-chartjs-2-vs-react-vis-vs-recharts-vs-victory

ChadcnUI Tutorial: https://www.youtube.com/watch?v=kol1ogbjxqo, https://www.youtube.com/watch?v=qI7QNaemphY


------------
# **Next.js Setup**
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
