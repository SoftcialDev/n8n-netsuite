import { IAuthenticateGeneric, ICredentialType, INodeProperties } from "n8n-workflow";

/**
 * NetSuiteApi Credential
 *
 * This credential allows users to specify the Base URL dynamically in `n8n`
 */
export class NetSuiteApi implements ICredentialType {
	// Internal name used by `n8n`
	name = 'netSuiteApi';

	// Display name visible to users in the credentials section
	displayName = 'NetSuite API';

	// Documentation URL for reference
	documentationUrl = 'https://www.netsuite.com/portal/home.shtml';

	// Credential properties available in `n8n`
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://api.yourdomain.com',
			description: 'Enter your NetSuite API Base URL',
		},
	];

	// Authentication method (no authentication required for now)
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};
}
