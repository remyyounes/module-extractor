const exportToDestination = (source, destination) => files => {
  files.map(absolutePath => {
    const relativePath = absolutePath.replace(source, '');

    fs.copySync(
      absolutePath,
      path.join(destination, relativePath)
    );
  })
};

module.exports = {
  exportToDestination,
};
