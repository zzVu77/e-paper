module.exports = {
  content: [
    './views/**/*.hbs', // Đảm bảo Tailwind đọc được các file handlebars trong thư mục views
    './public/**/*.html', // Đường dẫn tới các file HTML hoặc các file cần thiết khác
    './src/**/*.{js,jsx,ts,tsx}', // Đường dẫn tới các file JavaScript nếu cần],
    './public/**/*.css',
  ],
  prefix: 'tw-',
  important: true,
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
