
import T              from '../lib/tool.js';
import Config         from '../lib/config.js';
import VariableRender from '../lib/variable-render.js'

/*
 * Render storage config
 * @params {Object} params
 *   - {Object} storageConfig
 *   - {Integer} now - Date.now()
 *   - {String} domain
 *   - {String} format
 *   - {String} title
 *   - {String} category
 *   - {FilenameConflictResolver} nameConflictResolver
 *
 * @return {storageInfo, nameConflictResolver}
 */
function exec({storageConfig: config, now, domain,
  format, title, category: originalCategory, nameConflictResolver}) {

  const filenameValueHash = {now, title, format, domain};

  // folder and path
  const rootFolder = config.rootFolder;
  const storagePath = config.rootFolder;
  const category = dealCategory(config, originalCategory, now, domain);
  const categoryFolder = category;
  const categoryPath = dealCategoryPath(config, originalCategory, now, domain, storagePath);

  let pathValueHash = {storagePath, categoryPath, rootFolder, categoryFolder};
  let pathVariables = ['$STORAGE-PATH', '$CATEGORY-PATH', '$ROOT-FOLDER', '$CATEGORY-FOLDER'];

  let clippingPath = "clippingFolderName-not-specified";
  if (config.clippingFolderName) {
    const clippingFolder = VariableRender.exec(config.clippingFolderName,
      filenameValueHash, VariableRender.FilenameVariables);
    clippingPath = T.joinPath(categoryPath, clippingFolder);

    pathValueHash.clippingFolder = clippingFolder;
    pathValueHash.clippingPath = clippingPath;
    pathVariables.push('$CLIPPING-FOLDER');
    pathVariables.push('$CLIPPING-PATH');
  } else {
    // 3rd party don't need clippingPath
  }

  // FIXME category should be here?
  const storageInfo = {category: category};

  // storageInfo.raw stores storageConfig Items that can't be decided now.
  storageInfo.raw = {};
  // storageInfo.valueObj stores values that will be used to asset/iframe filename rendering.
  storageInfo.valueObj = {now, domain, title};

  // ====================================
  // render folders
  // ====================================
  const savingFolderVariables = [...pathVariables, ...VariableRender.TimeVariables, '$DOMAIN'];
  const savingFolderValueHash = Object.assign({now, domain}, pathValueHash);

  storageInfo.mainFileFolder = VariableRender.exec(
    fixPathVariable(config.mainFileFolder, 'mainFileFolder'),
    savingFolderValueHash, savingFolderVariables);
  nameConflictResolver.addFolder(storageInfo.mainFileFolder);

  storageInfo.assetFolder= VariableRender.exec(
    fixPathVariable(config.assetFolder, 'assetFolder'),
    savingFolderValueHash, savingFolderVariables);
  nameConflictResolver.addFolder(storageInfo.assetFolder);

  if (config.saveInfoFile) {
    storageInfo.infoFileFolder = VariableRender.exec(
      fixPathVariable(config.infoFileFolder, 'infoFileFolder'),
      savingFolderValueHash, savingFolderVariables);
    nameConflictResolver.addFolder(storageInfo.infoFileFolder);
  }

  if (config.saveTitleFile) {
    storageInfo.titleFileFolder= VariableRender.exec(
      fixPathVariable(config.titleFileFolder, 'titleFileFolder'),
      savingFolderValueHash, savingFolderVariables);
    nameConflictResolver.addFolder(storageInfo.titleFileFolder);
  }

  if (format === 'html') {
    storageInfo.frameFileFolder = VariableRender.exec(
      fixPathVariable(config.frameFileFolder, 'frameFileFolder'),
      savingFolderValueHash, savingFolderVariables);
    nameConflictResolver.addFolder(storageInfo.frameFileFolder);
  } else {
    // md don't need to store frame files
  }


  // ====================================
  // render filenames
  // ====================================

  const mainFileName = VariableRender.exec(config.mainFileName,
    filenameValueHash, VariableRender.FilenameVariables);
  storageInfo.mainFileName = nameConflictResolver.resolveFile('__mainFileName__', storageInfo.mainFileFolder, mainFileName);

  storageInfo.raw.assetFileName = config.assetFileName;

  if (config.saveInfoFile) {
    const infoFileName = VariableRender.exec(config.infoFileName,
      filenameValueHash, VariableRender.FilenameVariables);

    storageInfo.infoFileName = nameConflictResolver.resolveFile('__infoFileName__', storageInfo.infoFileFolder, infoFileName);
  }

  if (config.saveTitleFile) {
    const titleFileName = VariableRender.exec(config.titleFileName,
      filenameValueHash, VariableRender.FilenameVariables);
    storageInfo.titleFileName = nameConflictResolver.resolveFile('__titleFileName__', storageInfo.titleFileFolder, titleFileName);
  }

  if (format === 'html') {
    storageInfo.raw.frameFileName = config.frameFileName;
  }

  return {storageInfo, nameConflictResolver};
}

function dealCategory(config, category, now, domain) {
  if (category === '') {
    const v = {now: now, domain: domain};
    const defaultCategory = VariableRender.exec(config.defaultCategory,
      v, VariableRender.TimeVariables.concat(['$DOMAIN']));

    if (defaultCategory === '$NONE') {
      // Do nothing
    } else {
      category = defaultCategory || 'default';
    }
  } else {
    if (category === '$NONE') {
      category = '';
    } else {
      // Do nothing
    }
  }
  return category;
}

function dealCategoryPath(config, category, now, domain, storagePath) {
  let categoryPath;

  if (category === '') {
    const v = {now: now, domain: domain};
    const defaultCategory = VariableRender.exec(config.defaultCategory,
      v, VariableRender.TimeVariables.concat(['$DOMAIN']));

    if(defaultCategory === "$NONE"){
      categoryPath = storagePath;
    } else {
      categoryPath = T.joinPath(storagePath, defaultCategory || 'default');
    }
  } else {
    if(category === '$NONE'){
      categoryPath = storagePath;
    } else {
      categoryPath = T.joinPath(storagePath, category);
    }
  }
  return categoryPath
}

function fixPathVariable(value, key) {
  const DefaultConfig = Config.getDefault();
  if (value === '') {
    // user didn't specify any path, then we use default
    return DefaultConfig[key];
  } else {
    return value;
  }
}

const StorageConfigRender = {exec};
export default StorageConfigRender;
