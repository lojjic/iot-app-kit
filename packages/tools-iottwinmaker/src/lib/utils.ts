import { getDefaultAwsClients as aws } from './aws-clients';
import { ResourceNotFoundException } from '@aws-sdk/client-iottwinmaker';

/**
 * Helper function to wait for set amount of time
 * @param ms number of ms to wait
 */
async function delay(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Helper function during workspace nuke for determining existance of workspace
 * @param workspaceId TM workspace
 * @returns promise boolean
 */
async function verifyWorkspaceExists(workspaceId: string) {
  try {
    await aws().tm.getWorkspace({ workspaceId: workspaceId });
  } catch (e) {
    if (e instanceof ResourceNotFoundException) {
      console.error(`Error: workspace '${workspaceId}' not found. Please create it first.`);
      throw e;
    } else {
      console.error(`Failed to get workspace.`, e);
      throw e;
    }
  }
  console.log(`Verified workspace ${workspaceId} exists.`);
}

/**
 * Helper function for filling in role and policy templates during workspace creation
 * @param template JSON stringified role with missing values
 * @param dict dictionary of the missing values to fill in the template
 * @returns the complete JSON stringified template filled in
 */
function replaceTemplateVars(template: string, dict: Record<string, string>): string {
  let result = template;
  for (const key in dict) {
    if (Object.prototype.hasOwnProperty.call(dict, key)) {
      const value = dict[key];
      const regex = new RegExp('{' + key + '}', 'g');
      result = result.replace(regex, value);
    }
  }
  return result;
}

function regionToAirportCode(region: string): string {
  const airportRegionMap = new Map<string, string>([
    ['us-east-1', 'IAD'],
    ['eu-west-1', 'DUB'],
    ['us-west-1', 'SFO'],
    ['ap-southeast-1', 'SIN'],
    ['ap-northeast-1', 'NRT'],
    ['us-gov-west-1', 'PDT'],
    ['us-west-2', 'PDX'],
    ['sa-east-1', 'GRU'],
    ['ap-southeast-2', 'SYD'],
    ['cn-north-1', 'BJS'],
    ['eu-central-1', 'FRA'],
    ['us-iso-east-1', 'DCA'],
    ['ap-northeast-2', 'ICN'],
    ['ap-south-1', 'BOM'],
    ['us-east-2', 'CMH'],
    ['cn-northwest-1', 'ZHY'],
    ['eu-west-2', 'LHR'],
    ['ca-central-1', 'YUL'],
    ['us-isob-east-1', 'LCK'],
    ['eu-west-3', 'CDG'],
  ]);
  return airportRegionMap.get(region) || region;
}

export { delay, verifyWorkspaceExists, replaceTemplateVars, regionToAirportCode };
