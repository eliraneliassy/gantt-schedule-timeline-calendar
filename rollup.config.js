import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';

import stylusLib from 'stylus';
import { readFileSync, writeFileSync } from 'fs';
function stylus() {
  let result = '';
  let output = '';
  return {
    name: 'stylus',
    outputOptions(options) {
      output = options.file;
    },
    resolveId(source) {
      if (source.endsWith('.styl')) {
        return source;
      }
      return null;
    },
    load(id) {
      if (id.endsWith('.styl')) {
        const style = readFileSync(id, { encoding: 'utf8' });
        stylusLib.render(style, function (err, css) {
          if (err) throw err;
          result = css;
        });
        return 'var stylus=1;';
      }
      return null; // other ids should be handled as usually
    },
    writeBundle(bundle) {
      writeFileSync(output, result, { encoding: 'utf8' });
    },
  };
}

const production = !process.env.ROLLUP_WATCH;

const devFiles = [
  {
    input: 'src/gstc.ts',
    output: {
      sourcemap: true,
      file: 'dist/gstc.js',
      format: 'umd',
      name: 'GSTC',
    },
    //context: 'null',
    //moduleContext: 'null',
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      !production && livereload('dist'),
    ],
  },
  {
    input: 'src/gstc.ts',
    output: {
      sourcemap: true,
      file: 'dist/gstc.esm.js',
      format: 'esm',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/plugins/timeline-pointer.plugin.ts',
    output: {
      sourcemap: true,
      file: 'dist/timeline-pointer.plugin.js',
      format: 'umd',
      name: 'TimelinePointer',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/plugins/selection.plugin.ts',
    output: {
      sourcemap: true,
      file: 'dist/selection.plugin.js',
      format: 'umd',
      name: 'Selection',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/plugins/item-movement.plugin.ts',
    output: {
      sourcemap: true,
      file: 'dist/item-movement.plugin.js',
      format: 'umd',
      name: 'ItemMovement',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/plugins/item-resizing.plugin.ts',
    output: {
      sourcemap: true,
      file: 'dist/item-resizing.plugin.js',
      format: 'umd',
      name: 'ItemResizing',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/plugins/item-hold.plugin.ts',
    output: {
      sourcemap: true,
      file: 'dist/item-hold.plugin.js',
      format: 'umd',
      name: 'ItemHold',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/plugins/calendar-scroll.plugin.ts',
    output: {
      sourcemap: true,
      file: 'dist/calendar-scroll.plugin.js',
      format: 'umd',
      name: 'CalendarScroll',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/plugins/highlight-weekends.plugin.ts',
    output: {
      sourcemap: true,
      file: 'dist/highlight-weekends.plugin.js',
      format: 'umd',
      name: 'HighlightWeekends',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/plugins/plugins.ts',
    output: {
      sourcemap: true,
      file: 'dist/plugins.esm.js',
      format: 'esm',
      name: 'plugins',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/plugins/plugins.ts',
    output: {
      sourcemap: true,
      file: 'dist/plugins.js',
      format: 'umd',
      name: 'plugins',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/style.styl',
    output: { format: 'esm', file: 'dist/style.css' },
    plugins: [stylus()],
  },
];

const prodFiles = Array.prototype.concat(devFiles, [
  {
    input: 'src/gstc.ts',
    output: {
      sourcemap: false,
      file: 'dist/gstc.min.js',
      format: 'umd',
      name: 'GSTC',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        keep_classnames: true,
        keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },
  {
    input: 'src/gstc.ts',
    output: {
      sourcemap: false,
      file: 'dist/gstc.esm.min.js',
      format: 'esm',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },

  {
    input: 'src/plugins/timeline-pointer.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/timeline-pointer.plugin.esm.js',
      format: 'esm',
      name: 'TimelinePointer',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/plugins/timeline-pointer.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/timeline-pointer.plugin.esm.min.js',
      format: 'esm',
      name: 'TimelinePointer',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },
  {
    input: 'src/plugins/timeline-pointer.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/timeline-pointer.plugin.min.js',
      format: 'umd',
      name: 'TimelinePointer',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },

  {
    input: 'src/plugins/item-movement.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/item-movement.plugin.esm.js',
      format: 'esm',
      name: 'ItemMovement',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/plugins/item-movement.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/item-movement.plugin.esm.min.js',
      format: 'esm',
      name: 'ItemMovement',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },
  {
    input: 'src/plugins/item-movement.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/item-movement.plugin.min.js',
      format: 'umd',
      name: 'ItemMovement',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },

  {
    input: 'src/plugins/item-resizing.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/item-resizing.plugin.esm.js',
      format: 'esm',
      name: 'ItemResizing',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/plugins/item-resizing.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/item-resizing.plugin.esm.min.js',
      format: 'esm',
      name: 'ItemResizing',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },
  {
    input: 'src/plugins/item-resizing.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/item-resizing.plugin.min.js',
      format: 'umd',
      name: 'ItemResizing',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },

  {
    input: 'src/plugins/item-hold.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/item-hold.plugin.esm.js',
      format: 'esm',
      name: 'ItemHold',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/plugins/item-hold.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/item-hold.plugin.esm.min.js',
      format: 'esm',
      name: 'ItemHold',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },
  {
    input: 'src/plugins/item-hold.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/item-hold.plugin.min.js',
      format: 'umd',
      name: 'ItemHold',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },

  {
    input: 'src/plugins/selection.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/selection.plugin.esm.js',
      format: 'esm',
      name: 'Selection',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/plugins/selection.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/selection.plugin.esm.min.js',
      format: 'esm',
      name: 'Selection',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },
  {
    input: 'src/plugins/selection.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/selection.plugin.min.js',
      format: 'umd',
      name: 'Selection',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },

  {
    input: 'src/plugins/calendar-scroll.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/calendar-scroll.plugin.esm.js',
      format: 'esm',
      name: 'CalendarScroll',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/plugins/calendar-scroll.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/calendar-scroll.plugin.esm.min.js',
      format: 'esm',
      name: 'CalendarScroll',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },
  {
    input: 'src/plugins/calendar-scroll.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/calendar-scroll.plugin.min.js',
      format: 'umd',
      name: 'CalendarScroll',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },

  {
    input: 'src/plugins/highlight-weekends.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/highlight-weekends.plugin.esm.js',
      format: 'esm',
      name: 'HighlightWeekends',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
  {
    input: 'src/plugins/highlight-weekends.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/highlight-weekends.plugin.esm.min.js',
      format: 'esm',
      name: 'HighlightWeekends',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },
  {
    input: 'src/plugins/highlight-weekends.plugin.ts',
    output: {
      sourcemap: false,
      file: 'dist/highlight-weekends.plugin.min.js',
      format: 'umd',
      name: 'HighlightWeekends',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },

  {
    input: 'src/plugins/plugins.ts',
    output: {
      sourcemap: false,
      file: 'dist/plugins.esm.min.js',
      format: 'esm',
      name: 'Plugins',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },
  {
    input: 'src/plugins/plugins.ts',
    output: {
      sourcemap: false,
      file: 'dist/plugins.min.js',
      format: 'umd',
      name: 'Plugins',
    },
    plugins: [
      typescript({ target: 'es6' }),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: ['.js', '.ts'] }),
      terser({
        //keep_classnames: true,
        //keep_fnames: true,
        output: { comments: false },
      }),
    ],
  },
]);
const files = production ? prodFiles : devFiles;
export default files;
