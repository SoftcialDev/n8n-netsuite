import { INodeType, INodeTypeDescription } from "n8n-workflow";

/**
 * NetSuiteConnector Node
 *
 * This node interacts with a NetSuite-like API, allowing users to fetch data dynamically.
 */
export class NetSuiteConnector implements INodeType {
	description: INodeTypeDescription = {
		// Display name in `n8n`
		displayName: 'NetSuite Connector',

		// Internal name used in the system
		name: 'netSuiteConnector',

		// Icon displayed in `n8n`
		icon: 'file:netsuite.svg',

		// Node group (transformation, trigger, etc.)
		group: ['transform'],

		// Node version
		version: 1,

		// Subtitle displayed dynamically based on selected parameters
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',

		// Description shown in `n8n`
		description: 'Interact with a NetSuite-like API that requires user-defined authentication',

		// Default node configuration
		defaults: {
			name: 'NetSuite Connector',
		},

		// Node input and output definitions
		inputs: [{ type: 'main' as any }],
		outputs: [{ type: 'main' as any }],

		// Reference to the user-defined credentials
		credentials: [
			{
				name: 'netSuiteApi',
				required: true,
			},
		],

		// API request configuration
		requestDefaults: {
			// Dynamically use the API Base URL from the user's credentials
			baseURL: '={{$credentials.baseUrl}}',

			// Default headers for all requests
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},

		// Define available properties (parameters) for the node
		properties: [
			// -----------------------------------
			// Resource Selection
			// -----------------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Customers', value: 'customers' },
					{ name: 'Products', value: 'products' },
					{ name: 'Sales Orders', value: 'salesOrders' },
				],
				default: 'customers',
			},

			// -----------------------------------
			// Customers
			// -----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['customers'] },
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						action: 'Retrieve all customers (GET)',
						routing: { request: { method: 'GET', url: '/v1/customers' } },
					},
					{
						name: 'Get by Email',
						value: 'getByEmail',
						action: 'Retrieve a customer by email (POST)',
						routing: { request: { method: 'POST', url: '/v1/customers/search/by-email' } },
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['customers'], operation: ['getByEmail'] },
				},
				routing: {
					request: { body: { email: '={{$value}}' } },
				},
			},

			// -----------------------------------
			// Products
			// -----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['products'] },
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						action: 'Retrieve all products (GET)',
						routing: { request: { method: 'GET', url: '/v1/products' } },
					},
					{
						name: 'Get Price by ID',
						value: 'getPrice',
						action: 'Retrieve product price by product ID (GET)',
						routing: {
							request: {
								method: 'GET',
								url: '=/v1/products/{{$parameter["productId"]}}/prices',
							},
						},
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Product ID',
				name: 'productId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: { resource: ['products'], operation: ['getPrice'] },
				},
			},

			// -----------------------------------
			// Sales Orders
			// -----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['salesOrders'] },
				},
				options: [
					{
						name: 'Get Items by Transaction Number',
						value: 'getItems',
						action: 'Retrieve items by Transaction Number (GET)',
						routing: {
							request: {
								method: 'GET',
								url: '=/v1/salesorders/{{$parameter["transactionNumber"]}}/items',
							},
						},
					},
					{
						name: 'Get by Date Range',
						value: 'getByDateRange',
						action: 'Retrieve sales orders within a date range (POST)',
						routing: {
							request: {
								method: 'POST',
								url: '/v1/salesorders/daterange',
							},
						},
					},
				],
				default: 'getItems',
			},
			{
				displayName: 'Transaction Number',
				name: 'transactionNumber',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: { resource: ['salesOrders'], operation: ['getItems'] },
				},
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				default: '',
				required: true,
				displayOptions: {
					show: { resource: ['salesOrders'], operation: ['getByDateRange'] },
				},
				routing: {
					request: {
						body: {
							start_date: '={{ new Date($value).toISOString().substring(0,10) }}',
						},
					},
				},
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				default: '',
				required: true,
				displayOptions: {
					show: { resource: ['salesOrders'], operation: ['getByDateRange'] },
				},
				routing: {
					request: {
						body: {
							end_date: '={{ new Date($value).toISOString().substring(0,10) }}',
						},
					},
				},
			},
		],
	};
}
