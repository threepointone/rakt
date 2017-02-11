module.exports = function(source, map) {
  if(source.indexOf('$ENTRY') >= 0){
    return source.replace(/\$ENTRY/g, `'${this.query.entry}'`)  
  }
  return source
  
}

// strip App.setup