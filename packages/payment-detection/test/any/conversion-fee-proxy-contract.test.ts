import {
  AdvancedLogicTypes,
  ExtensionTypes,
  IdentityTypes,
  PaymentTypes,
  RequestLogicTypes,
} from '@requestnetwork/types';
import ConversionERC20FeeProxyContract from '../../src/any/conversion-fee-proxy-contract';

let erc20FeeProxyContract: ConversionERC20FeeProxyContract;

const mockAdvancedLogic: AdvancedLogicTypes.IAdvancedLogic = {
  applyActionToExtensions(): any {
    return;
  },
  extensions: {
    conversionFeeProxyContract: {
      createAddPaymentAddressAction(): any {
        return;
      },
      createAddRefundAddressAction(): any {
        return;
      },
      createCreationAction(): any {
        return;
      },
      createAddFeeAction(): any {
        return;
      },
    },
  },
};

/* tslint:disable:no-unused-expression */
describe('api/any/conversion-fee-proxy-contract', () => {
  beforeEach(() => {
    erc20FeeProxyContract = new ConversionERC20FeeProxyContract({ advancedLogic: mockAdvancedLogic });
  });

  it('can createExtensionsDataForCreation', async () => {
    const spy = jest.spyOn(
      mockAdvancedLogic.extensions.conversionFeeProxyContract,
      'createCreationAction',
    );

    await erc20FeeProxyContract.createExtensionsDataForCreation({
      paymentAddress: 'ethereum address',
      salt: 'ea3bc7caf64110ca',
      tokensAccepted: ['ethereum address2'],
      network: 'rinkeby',
      maxRateTimespan: 1000,
    });

    expect(spy).toHaveBeenCalledWith({
      feeAddress: undefined,
      feeAmount: undefined,
      paymentAddress: 'ethereum address',
      refundAddress: undefined,
      salt: 'ea3bc7caf64110ca',
      tokensAccepted: ['ethereum address2'],
      network: 'rinkeby',
      maxRateTimespan: 1000,
    });
  });

  it('can createExtensionsDataForCreation with fee amount and address', async () => {
    const spy = jest.spyOn(
      mockAdvancedLogic.extensions.conversionFeeProxyContract,
      'createCreationAction',
    );

    await erc20FeeProxyContract.createExtensionsDataForCreation({
      feeAddress: 'fee address',
      feeAmount: '2000',
      paymentAddress: 'ethereum address',
      salt: 'ea3bc7caf64110ca',
      tokensAccepted: ['ethereum address2'],
    });

    expect(spy).toHaveBeenCalledWith({
      feeAddress: 'fee address',
      feeAmount: '2000',
      paymentAddress: 'ethereum address',
      refundAddress: undefined,
      salt: 'ea3bc7caf64110ca',
      tokensAccepted: ['ethereum address2'],
    });
  });

  it('can createExtensionsDataForCreation without salt', async () => {
    const spy = jest.spyOn(
      mockAdvancedLogic.extensions.conversionFeeProxyContract,
      'createCreationAction',
    );

    await erc20FeeProxyContract.createExtensionsDataForCreation({
      paymentAddress: 'ethereum address',
    });

    // Can't check parameters since salt is generated in createExtensionsDataForCreation
    expect(spy).toHaveBeenCalled();
  });

  it('can createExtensionsDataForAddPaymentInformation', async () => {
    const spy = jest.spyOn(
      mockAdvancedLogic.extensions.conversionFeeProxyContract,
      'createAddPaymentAddressAction',
    );

    erc20FeeProxyContract.createExtensionsDataForAddPaymentInformation({
      paymentAddress: 'ethereum address',
    });

    expect(spy).toHaveBeenCalledWith({
      paymentAddress: 'ethereum address',
    });
  });

  it('can createExtensionsDataForAddRefundInformation', async () => {
    const spy = jest.spyOn(
      mockAdvancedLogic.extensions.conversionFeeProxyContract,
      'createAddRefundAddressAction',
    );

    erc20FeeProxyContract.createExtensionsDataForAddRefundInformation({
      refundAddress: 'ethereum address',
    });

    expect(spy).toHaveBeenCalledWith({
      refundAddress: 'ethereum address',
    });
  });

  it('can createExtensionsDataForAddFeeInformation', async () => {
    const spy = jest.spyOn(
      mockAdvancedLogic.extensions.conversionFeeProxyContract,
      'createAddFeeAction',
    );

    erc20FeeProxyContract.createExtensionsDataForAddFeeInformation({
      feeAddress: 'ethereum address',
      feeAmount: '2000',
    });

    expect(spy).toHaveBeenCalledWith({
      feeAddress: 'ethereum address',
      feeAmount: '2000',
    });
  });

  it('should not throw when getBalance fail', async () => {
    expect(
      await erc20FeeProxyContract.getBalance({ extensions: {} } as RequestLogicTypes.IRequest),
    ).toEqual({
      balance: null,
      error: {
        code: PaymentTypes.BALANCE_ERROR_CODE.WRONG_EXTENSION,
        message: 'The request does not have the extension : pn-any-erc20-conversion-fee-proxy-contract',
      },
      events: [],
    });
  });

  it('can get the fees out of payment events', async () => {
    const mockRequest: RequestLogicTypes.IRequest = {
      creator: { type: IdentityTypes.TYPE.ETHEREUM_ADDRESS, value: '0x2' },
      currency: {
        type: RequestLogicTypes.CURRENCY.ISO4217,
        value: 'EUR',
      },
      events: [],
      expectedAmount: '1000',
      extensions: {
        [ExtensionTypes.ID.PAYMENT_NETWORK_ANY_ERC20_CONVERSION_FEE_PROXY_CONTRACT]: {
          events: [],
          id: ExtensionTypes.ID.PAYMENT_NETWORK_ANY_ERC20_CONVERSION_FEE_PROXY_CONTRACT,
          type: ExtensionTypes.TYPE.PAYMENT_NETWORK,
          values: {
            feeAddress: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
            feeAmount: '5',
            paymentAddress: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
            refundAddress: '0x666666151EbEF6C7334FAD080c5704D77216b732',
            tokensAccepted: ['0x9FBDa871d559710256a2502A2517b794B482Db40'],
          },
          version: '0',
        },
      },
      extensionsData: [],
      requestId: '0x1',
      state: RequestLogicTypes.STATE.CREATED,
      timestamp: 0,
      version: '0.2',
    };

    const mockExtractBalanceAndEvents: any = (
      _request: RequestLogicTypes.IRequest,
      _salt: string,
      _toAddress: string,
      eventName: PaymentTypes.EVENTS_NAMES) => {
      if(eventName === PaymentTypes.EVENTS_NAMES.PAYMENT) {
        return Promise.resolve({
          balance: '1000',
          events: [
            // Wrong fee address
            {
              amount: '100',
              name: PaymentTypes.EVENTS_NAMES.PAYMENT,
              parameters: {
                block: 1,
                feeAddress: 'fee address',
                feeAmount: '5',
                to: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
                txHash: '0xABC',
              },
              timestamp: 10,
            },
            // Correct fee address and a fee value
            {
              amount: '500',
              name: PaymentTypes.EVENTS_NAMES.PAYMENT,
              parameters: {
                block: 1,
                feeAddress: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
                feeAmount: '5',
                to: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
                txHash: '0xABCD',
              },
              timestamp: 11,
            },
            // No fee
            {
              amount: '500',
              name: PaymentTypes.EVENTS_NAMES.PAYMENT,
              parameters: {
                block: 1,
                feeAddress: '',
                feeAmount: '0',
                to: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
                txHash: '0xABCDE',
              },
              timestamp: 12,
            }
          ],
        });
      }
      if(eventName === PaymentTypes.EVENTS_NAMES.REFUND) {
        return Promise.resolve({
          balance: '200',
          events: [
            // Wrong fee address
            {
              amount: '1000',
              name: PaymentTypes.EVENTS_NAMES.REFUND,
              parameters: {
                block: 1,
                feeAddress: 'fee address',
                feeAmount: '5',
                to: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
                txHash: '0xABC',
              },
              timestamp: 10,
            },
            // Correct fee address and a fee value
            {
              amount: '100',
              name: PaymentTypes.EVENTS_NAMES.REFUND,
              parameters: {
                block: 1,
                feeAddress: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
                feeAmount: '5',
                to: '0x666666151EbEF6C7334FAD080c5704D77216b732',
                txHash: '0xABCD',
              },
              timestamp: 11,
            },
            // No fee
            {
              amount: '100',
              name: PaymentTypes.EVENTS_NAMES.REFUND,
              parameters: {
                block: 1,
                feeAddress: '',
                feeAmount: '0',
                to: '0x666666151EbEF6C7334FAD080c5704D77216b732',
                txHash: '0xABCDE',
              },
              timestamp: 12,
            }
          ],
        });
      }
    };
    erc20FeeProxyContract = new ConversionERC20FeeProxyContract({ advancedLogic: mockAdvancedLogic });
    erc20FeeProxyContract.extractBalanceAndEvents = mockExtractBalanceAndEvents;

    const balance = await erc20FeeProxyContract.getBalance(mockRequest);
    expect(balance.balance).toBe('800');
    expect(
      mockRequest.extensions[ExtensionTypes.ID.PAYMENT_NETWORK_ANY_ERC20_CONVERSION_FEE_PROXY_CONTRACT].values
        .feeBalance.balance,
    ).toBe('10');
  });
});
