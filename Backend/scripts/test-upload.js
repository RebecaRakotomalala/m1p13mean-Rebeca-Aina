const uploadService = require('../services/upload.service');

(async () => {
  const sample = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=';
  try {
    const result = await uploadService.uploadImage(sample);
    console.log('Result', result);
  } catch (err) {
    console.error('Upload failed', err.message);
    if (err.stack) console.error(err.stack);
  }
})();
