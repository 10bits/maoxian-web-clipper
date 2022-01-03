import Task   from '../lib/task.js';
import CaptureTool from './tool.js';


/*!
 * Capture SnapshotNode OBJECT
 *
 * @param {SnapshotNode} node
 * @param {Object} params
 *   - {String} baseUrl
 *   - {String} clipId
 *   - {Object} storageInfo
 *   - {RequestParams} requestParams
 *   - {Object} config
 *
 */
async function capture(node, params) {
  const {config} = params;
  switch(config.htmlCaptureObject) {
    case 'remove':
      return CaptureTool.captureRemoveNode();
    case 'saveAll':
      return await captureSaveAll(node, params);
    case 'filter':
    default:
      return await captureFilter(node, params);
  }
}


async function captureSaveAll(node, params) {
  const resourceType = Task.getResourceType(node.attr.data, node.attr.type);
  const attrParams = {resourceType, attrName: 'data', mimeTypeAttrName: 'type'};
  return await CaptureTool.captureAttrResource(node, params, attrParams);
}


async function captureFilter(node, params) {
  if (CaptureTool.isFilterMatch(params.config.htmlObjectFilter, node.attr.data, node.attr.type)) {
    return await captureSaveAll(node, params);
  } else {
    return CaptureTool.captureRemoveNode();
  }
}


export default {capture};