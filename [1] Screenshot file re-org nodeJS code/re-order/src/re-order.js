const fs        = require('fs');
const path      = require('path');
const regedit   = require('regedit');

const screenshotFolder = 'C:\\Users\\Peter Ebode\\Pictures\\Screenshots'; //Path to screenshot folder
const keyPath = 'HKCU\\SOFTWARE\\MICROSOFT\\Windows\\CurrentVersion\\Explorer'; //Registry key for screenshot counter

// Read all files in screenshot folder
fs.readdir(screenshotFolder, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
  
    // Filter only image files (png, jpg, jpeg)
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
    });

    // Sort image files by filename (numeric order)
    imageFiles.sort((a, b) => {
        const aFile = parseInt(path.basename(a, path.extname(a)).match(/\d+/)[0]);
        const bFile = parseInt(path.basename(b, path.extname(b)).match(/\d+/)[0]);
        return aFile - bFile;
    });

    // Rename image files to have sequential filenames (starting from 1)
    console.log('Screenshots file Re-organization started...')
    imageFiles.forEach((file, i) => {
        const oldPath = path.join(screenshotFolder, file);
        const newPath = path.join(screenshotFolder, `Screenshot (${i + 1})${path.extname(file)}`);
        fs.rename(oldPath, newPath, err => {
            if (err) {
                console.error(err);
                return;
            }
        });
    });
    console.log(`Screenshots file(${imageFiles.length}) Re-organization complete.`)

    //REGISTRY UPDATE
    // Get the previous screenshot counter value from the registry
    regedit.list([keyPath], (err, result) => {
        if (err) {
        console.error(err);
        return;
        }
    
        const previousValue = result[keyPath].values['ScreenshotIndex'].value; //Previous Screenshot Value
        const newValue      = imageFiles.length; //New Value from Directory scan


        // Update the screenshot counter value in Windows' registry
        regedit.putValue({
                [keyPath]: {
                    'ScreenShotIndex': {
                        value: newValue,
                        type: 'REG_DWORD'
                    }
                }
            },(err) => {
            if (err) {
            console.error(err);
            return;
        }

            console.log(`\nRegistry Screenshot counter value updated from ${previousValue}, to a New value of ${newValue}.\n`);
        });
    
    });

  });