<%= projectName %>
==================

<%= projectDescription %>

## Prerequisites

* [Node.js >=4.3.1](https://nodejs.org) - earlier releases of Node.js *may* work but haven't been tested

## Installation instructions

* Install Gulp task runner and its dependencies by running Node.js package manager (npm)

        npm install

* Copy gulp.config.local.js.dist as gulp.config.local.js and edit gulp.config.local.js to set temporary ( *tmpPath* ) and deploy ( *deployPath* ) paths

    >This is needed to enable automatic deployment of your code.
    >The *temporary* path is used by the build chain to store temporary files.
    >The built site is deployed into the *deploy* path.

* Launch *default* Gulp task by running

        gulp

    >This command launch the *default* Gulp task.
    >The *default* task first build and deploy the site.
    >It then executes watchers that automatically deploy any changes.

* Code !

* See the results in realtime by opening http://localhost:3000/styleguide in your favorite browser