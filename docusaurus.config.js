// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '刘青的技术认知点滴',
  tagline: 'Keep Thinking, Keep Evolving',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/blog/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'liuqing', // Usually your GitHub org/user name.
  projectName: 'blog', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/liuqing6767/blog/tree/main/',
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: '刘青的技术认知点滴',
        logo: {
          alt: '刘青的技术认知点滴',
          src: 'img/logo.png',
        },
        items: [
          {
            // type: 'docSidebar',
            sidebarId: 'network',
            position: 'left',
            to: "/docs/network",
            label: '计算机网络',
          },
          {
            // type: 'docSidebar',
            sidebarId: 'web_develop',
            position: 'left',
            label: '服务端业务开发',
            to: "/docs/web_develop",
          },
          {
            // type: 'docSidebar',
            sidebarId: 'program_basic',
            to: "/docs/program_basic",
            position: 'left',
            label: '编程本源',
          },
          // {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/liuqing6767/blog',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '| 专业领域',
            items: [
              {
                label: '计算机网络',
                to: '/docs/network',
              },
              {
                label: '服务端开发',
                to: '/docs/web_develop',
              },
              {
                label: '编程本源',
                to: '/docs/program_basic',
              },
            ],
          },
          {
            title: '| META',
            items: [
              {
                label: '对问题的解法保持极度开放',
                href: '#',
              },
              {
                label: '有效犯错的前提是反思',
                href: '#',
              },
            ],
          },
          {
            title: '| 联系我',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/liuqing6767/blog',
              },

              {
                label: '个人公众号 | SomebodyThinking',
                href: 'https://mp.weixin.qq.com/mp/qrcode?scene=10000004&size=102&__biz=MzIxMTI0MjY3Ng==&mid=2247483740&idx=1&sn=3d7871543d15dd86599ad7d03918e0a9&send_time=',
              },
              {
                label: '😊',
                href: '#',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 个人领域知识丰富, Inc. Built with Docusaurus.`,
      },
      prism: {
        darkTheme: prismThemes.dracula,
        theme: prismThemes.github,
      },
    }),
};

export default config;
