Pecan-Middleware
----------------

**Pecan-Middleware** compiles your templates on the fly and writes them to files in your chosen destination as functions you can execute in your client-side JS.

If you're looking for a build tool for precompiling your templates, especially if you're dealing with large numbers of templates or even building out numanced templates into parallel locations, [Asparagus](https://github.com/JoeChapman/asparagus) is your friend.

----------------------------

### Install & setup

`$ npm install pecan-middleware`

### On the server
```
var express = require('express'),
    pecanMiddleware = require('pecan-middleware'),
    app = express();
```

Use the middleware in your app and pass in options.

```
app.use(pecanMiddleware(__dirname + '/views/includes', {
    dest: __dirname + '/public/templates'
    namespace: 'templates',
    format: 'camelcase'
}));
```

- `src` - (required) is the source location of the Jade templates you want to have compiled.
For backwards-compatibility `src` can be defined as an option i.e., `{ src: '...' }`

#### Options

- `dest`- the destination for your compiled templates (defaults to `src`).
- `namespace` - the namespace for your templates map in the browser (defaults to 'jadeTemplates').
- `format` - the format of the function name added to the namespace for each template request (defaults to 'underscore').
- `allow` - use this to filter js requests for resources that aren't intended to be compiled, e.g., this might be '/templates/'.
- `compilerFunction` - This option will default to the Jade compiler, but you can try other template compilers.
- `ext` - by default this is '.jade', but if you want to use a different compilerFunction, you'll also need to use a different extension.

#### Formats

- `'underscore'` - will convert spaces and hyphens to underscores i.e., *my jade-template.jade* becomes *my_jade_template.jade*
- `'camelcase'` - will convert strings to camelcase i.e., *my jade-template.jade* becomes *myJadeTemplate.jade*

---------------------------

### In the browser

Get [Jade runtime](https://raw.githubusercontent.com/visionmedia/jade/master/runtime.js) and include in your project, i.e., `script src='lib/runtime.js'`


Request a template i.e., `script src='templates/my-jade-template.js'` and if the equivalent jade template exists in your `src` location, it will be compiled and written to an optional `dest` location or `src`.


LICENSE
-------

MIT
