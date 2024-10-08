import React, { useCallback, useState } from 'react'
import { Flex, ImpactFeedbackStyle, Text, TouchableArea, isWeb } from 'ui/src'
import { iconSizes } from 'ui/src/theme'
import { TokenLogo } from 'uniswap/src/components/CurrencyLogo/TokenLogo'
import { TokenOption } from 'uniswap/src/components/TokenSelector/types'
import WarningIcon from 'uniswap/src/components/icons/WarningIcon'
import { SafetyLevel } from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'
import TokenWarningModal from 'uniswap/src/features/tokens/TokenWarningModal'
import { shortenAddress } from 'uniswap/src/utils/addresses'
import { getSymbolDisplayText } from 'uniswap/src/utils/currency'

interface OptionProps {
  option: TokenOption
  showWarnings: boolean
  onDismiss?: () => void
  onPress: () => void
  showTokenAddress?: boolean
  tokenWarningDismissed: boolean
  dismissWarningCallback: () => void
  quantity: number | null
  // TODO(WEB-3643): Share localization context with WEB
  // (balance, quantityFormatted)
  balance: string
  quantityFormatted: string
}

function _TokenOptionItem({
  option,
  showWarnings,
  onDismiss,
  onPress,
  showTokenAddress,
  tokenWarningDismissed,
  dismissWarningCallback,
  balance,
  quantity,
  quantityFormatted,
}: OptionProps): JSX.Element {
  const { currencyInfo } = option
  const { currency, currencyId, safetyLevel, logoUrl } = currencyInfo

  const [showWarningModal, setShowWarningModal] = useState(false)

  const onPressTokenOption = useCallback(() => {
    if (
      showWarnings &&
      (safetyLevel === SafetyLevel.Blocked ||
        ((safetyLevel === SafetyLevel.MediumWarning || safetyLevel === SafetyLevel.StrongWarning) &&
          !tokenWarningDismissed))
    ) {
      onDismiss?.()
      setShowWarningModal(true)
      return
    }

    onPress()
  }, [showWarnings, safetyLevel, tokenWarningDismissed, onPress, onDismiss])

  const onAcceptTokenWarning = useCallback(() => {
    dismissWarningCallback()
    setShowWarningModal(false)
    onPress()
  }, [dismissWarningCallback, onPress])

  return (
    <>
      <TouchableArea
        hapticFeedback
        hapticStyle={ImpactFeedbackStyle.Light}
        opacity={showWarnings && safetyLevel === SafetyLevel.Blocked ? 0.5 : 1}
        testID={`token-option-${currency.chainId}-${currency.symbol}`}
        width="100%"
        onPress={onPressTokenOption}
      >
        <Flex
          row
          alignItems="center"
          data-testid={`token-option-${currency.chainId}-${currency.symbol}`}
          gap="$spacing8"
          justifyContent="space-between"
          py="$spacing12"
        >
          <Flex row shrink alignItems="center" gap={isWeb ? '$spacing8' : '$spacing12'}>
            <TokenLogo
              chainId={currency.chainId}
              name={currency.name}
              size={isWeb ? iconSizes.icon36 : undefined}
              symbol={currency.symbol}
              url={currencyInfo.logoUrl ?? undefined}
            />
            <Flex shrink>
              <Flex row alignItems="center" gap="$spacing8">
                <Text color="$neutral1" numberOfLines={1} variant={isWeb ? 'body2' : 'body1'}>
                  {currency.name}
                </Text>
                {(safetyLevel === SafetyLevel.Blocked || safetyLevel === SafetyLevel.StrongWarning) && (
                  <Flex>
                    <WarningIcon safetyLevel={safetyLevel} size="$icon.16" strokeColorOverride="neutral3" />
                  </Flex>
                )}
              </Flex>
              <Flex row alignItems="center" gap="$spacing8">
                <Text color="$neutral2" numberOfLines={1} variant="body3">
                  {getSymbolDisplayText(currency.symbol)}
                </Text>
                {!currency.isNative && showTokenAddress && (
                  <Flex shrink>
                    <Text color="$neutral3" numberOfLines={1} variant="body3">
                      {shortenAddress(currency.address)}
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Flex>

          {quantity && quantity !== 0 ? (
            <Flex alignItems="flex-end">
              <Text variant={isWeb ? 'body2' : 'body1'}>{balance}</Text>
              <Text color="$neutral2" variant={isWeb ? 'body3' : 'subheading2'}>
                {quantityFormatted}
              </Text>
            </Flex>
          ) : null}
        </Flex>
      </TouchableArea>

      <TokenWarningModal
        currencyId={currencyId}
        isVisible={showWarningModal}
        safetyLevel={safetyLevel}
        tokenLogoUrl={logoUrl}
        onAccept={onAcceptTokenWarning}
        onClose={(): void => setShowWarningModal(false)}
      />
    </>
  )
}

export const TokenOptionItem = React.memo(_TokenOptionItem)
