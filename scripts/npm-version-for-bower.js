var shell = require('shelljs');
var VERSION = require('../package.json').version;

// A small wrapper around shell.exec to ensure that we exit the process
// properly if any step fails.
var exec = function() {
  var result = shell.exec.apply(shell, arguments);
  process.stdout.write(result.output);
  if (result.code !== 0) {
    process.exit(result.code);
  }
  return result;
};

exec('git add package.json');
exec('git commit -m "' + VERSION + '"');
exec('npm run build');
exec('git add -f dist');
