const { src, dest, watch, parallel, series } = require('gulp')

const scss          = require('gulp-sass')(require('sass'))
const concat        = require('gulp-concat')
const browserSync   = require('browser-sync').create()
const uglify        = require('gulp-uglify-es').default
const autoprefixer  = require('gulp-autoprefixer')
const imagemin      = require('gulp-imagemin')
const del           = require('del')
const ghPages       = require('gulp-gh-pages')

function deploy(){
    return src('./dist/**/*')
    .pipe(ghPages())
}

function browsersync(){
    browserSync.init({
        server : {
            baseDir: 'app/'
        }
    })
}

function styles(){
    return src('app/styles/styles.scss')
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(concat('styles.min.css'))
    .pipe(autoprefixer({
        overrideBrowserslist: ['last 10 version'],
        grid : true
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function scripts(){
    return src([
        'app/js/main.js',
        'node_modules/jquery/dist/jquery.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function images(){
    return src('app/img/**/*')
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(dest('dist/img'))
}

function build(){
    return src([
        'app/css/styles.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ],  {base: 'app'})
        .pipe(dest('dist'))
}

function cleanDist(){
    return del('dist')
}

function watching(){
    watch(['app/styles/**/*.scss'], styles)
    watch(['app/scripts/**/*.js' ,'!app/scripts/main.min.js'],scripts)
    watch(['app/*.html']).on('change',browserSync.reload)
}

exports.styles = styles
exports.scripts = scripts
exports.watching = watching
exports.browsersync = browsersync
exports.images = images
exports.cleanDist = cleanDist
exports.deploy = deploy

exports.build = series(cleanDist, images, build)
exports.default = parallel(scripts, browsersync, watching, styles)