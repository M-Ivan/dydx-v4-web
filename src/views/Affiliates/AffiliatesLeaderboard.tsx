import { useEffect, useState } from 'react';

import axios from 'axios';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';

import { IAffiliateStats } from '@/constants/affiliates';
import { ButtonAction } from '@/constants/buttons';
import { STRING_KEYS } from '@/constants/localization';

import { useBreakpoints } from '@/hooks/useBreakpoints';
import { useStringGetter } from '@/hooks/useStringGetter';

import breakpoints from '@/styles/breakpoints';
import { layoutMixins } from '@/styles/layoutMixins';
import { tradeViewMixins } from '@/styles/tradeViewMixins';

import { Button } from '@/components/Button';
import { ContentSectionHeader } from '@/components/ContentSectionHeader';
import { Output, OutputType } from '@/components/Output';
import { AllTableProps, Table, type ColumnDef } from '@/components/Table';
import { TableCell } from '@/components/Table/TableCell';
import { Tag } from '@/components/Tag';
import { ToggleGroup } from '@/components/ToggleGroup';
import { Toolbar } from '@/components/Toolbar';

enum AffiliateEpochsFilter {
  ALL = 'all',
  EPOCH_1 = 'Epoch 1',
  EPOCH_2 = 'Epoch 2',
}

export const AFFILIATE_FILTERS_OPTIONS: Record<
  AffiliateEpochsFilter,
  {
    label?: string;
  }
> = {
  [AffiliateEpochsFilter.ALL]: {
    label: STRING_KEYS.ALL,
  },
  [AffiliateEpochsFilter.EPOCH_1]: {
    // label: 'APP.GENERAL.EPOCH_1',
  },
  [AffiliateEpochsFilter.EPOCH_2]: {
    // label: 'APP.GENERAL.EPOCH_2',
  },
};

interface IAffiliatesFilterProps {
  selectedFilter: AffiliateEpochsFilter;
  filters: AffiliateEpochsFilter[];
  onChangeFilter: (filter: AffiliateEpochsFilter) => void;
  compactLayout?: boolean;
}

const AffiliatesFilter = ({
  selectedFilter,
  filters,
  onChangeFilter,
  compactLayout = false,
}: IAffiliatesFilterProps) => {
  const stringGetter = useStringGetter();

  return (
    <$AffiliatesFilter $compactLayout={compactLayout}>
      <div tw="row">
        <$ToggleGroupContainer $compactLayout={compactLayout}>
          <$ToggleGroup
            items={Object.values(filters).map((value) => ({
              label: stringGetter({
                key: AFFILIATE_FILTERS_OPTIONS[value].label,
                fallback: value,
              }),
              value,
            }))}
            value={selectedFilter}
            onValueChange={onChangeFilter}
          />
        </$ToggleGroupContainer>
      </div>
    </$AffiliatesFilter>
  );
};

export const AffiliatesLeaderboard = ({
  className,
  accountStats,
}: {
  className?: string;
  accountStats?: IAffiliateStats;
}) => {
  const { isTablet } = useBreakpoints();
  const stringGetter = useStringGetter();
  const affiliatesFilters = Object.values(AffiliateEpochsFilter);
  const [affiliates, setAffiliates] = useState<IAffiliateStats[]>([]);
  const [epochFilter, setEpochFilter] = useState<AffiliateEpochsFilter>(AffiliateEpochsFilter.ALL);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchAffiliateStats();
  }, [page]);

  const fetchAffiliateStats = async () => {
    // Comment for testing with local data
    const response = await axios.post('http://localhost:3000/v1/leaderboard/search', {
      pagination: {
        page,
        pageSize: 10, // Amount of entities to load
      },
    });

    setAffiliates([...affiliates, ...response.data.results]);

    setTotal(response.data.total);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const columns: ColumnDef<IAffiliateStats>[] = isTablet
    ? [
        {
          columnKey: 'rank',
          label: stringGetter({ key: STRING_KEYS.RANK }),
          renderCell: ({ rank, account }) => {
            return (
              <TableCell className="align-center flex">
                {rank}

                {accountStats?.account && account === accountStats.account && (
                  <Tag className="bg-color-accent">{stringGetter({ key: STRING_KEYS.YOU })}</Tag>
                )}
              </TableCell>
            );
          },
          allowsSorting: false,
        },
        {
          columnKey: 'account',
          label: stringGetter({ key: STRING_KEYS.ACCOUNT }),
          allowsSorting: false,

          renderCell: ({ account }) => `${account.slice(0, 8)}...${account.slice(-5)}`,
        },
        {
          columnKey: 'total-earnings',
          label: stringGetter({ key: STRING_KEYS.TOTAL }),
          allowsSorting: false,

          renderCell: ({ totalEarnings, totalReferredUsers }) => (
            <TableCell className="flex flex-col justify-start text-end">
              <div className="w-full">
                <$EarningsOutput
                  type={OutputType.CompactFiat}
                  value={totalEarnings}
                  slotRight={
                    <span className="ml-0.25 text-color-text-2">
                      {stringGetter({ key: STRING_KEYS.EARNINGS })}
                    </span>
                  }
                />
              </div>
              <div className="w-full text-color-text-0">
                {totalReferredUsers.toLocaleString()}{' '}
                {stringGetter({ key: STRING_KEYS.USERS_REFERRED })}
              </div>
            </TableCell>
          ),
        },
      ]
    : [
        {
          columnKey: 'rank',
          label: stringGetter({ key: STRING_KEYS.RANK }),
          allowsSorting: false,
          renderCell: ({ rank, account }) => (
            <TableCell className="align-center flex text-color-text-1 font-medium-book">
              {rank}
              {accountStats?.account && account === accountStats.account && (
                <Tag className="bg-color-accent">{stringGetter({ key: STRING_KEYS.YOU })}</Tag>
              )}
            </TableCell>
          ),
        },
        {
          columnKey: 'account',
          label: stringGetter({ key: STRING_KEYS.ACCOUNT }),
          allowsSorting: false,

          renderCell: ({ account }) => (
            <$DesktopOutput
              type={OutputType.Text}
              // value={`${account.slice(0, 8)}...${account.slice(-5)}`}
              value={account}
            />
          ),
        },
        {
          columnKey: 'total-earnings',
          label: stringGetter({ key: STRING_KEYS.TOTAL_EARNINGS }),
          allowsSorting: false,

          renderCell: ({ totalEarnings }) => (
            <$EarningsOutput type={OutputType.CompactFiat} value={totalEarnings} />
          ),
        },
        {
          columnKey: 'ref-vol',
          label: stringGetter({ key: STRING_KEYS.VOLUME_REFERRED }),
          allowsSorting: false,

          renderCell: ({ referredVolume }) => (
            <$NumberOutput type={OutputType.CompactFiat} value={referredVolume} />
          ),
        } as ColumnDef<IAffiliateStats>,

        {
          columnKey: 'ref-fees',
          label: stringGetter({ key: STRING_KEYS.FEES_REFERRED }),
          allowsSorting: false,
          renderCell: ({ referredFees }) => (
            <$NumberOutput type={OutputType.CompactFiat} value={referredFees} />
          ),
        } as ColumnDef<IAffiliateStats>,

        {
          columnKey: 'total-referred-users',
          label: stringGetter({ key: STRING_KEYS.USERS_REFERRED }),
          allowsSorting: false,
          renderCell: ({ totalReferredUsers }) => (
            <$NumberOutput type={OutputType.Number} value={totalReferredUsers} />
          ),
        },
      ];

  const setFilter = (newFilter: AffiliateEpochsFilter) => {
    setEpochFilter(newFilter);
  };

  return (
    <div className="flex flex-col gap-y-1">
      <div>
        <ContentSectionHeader title={stringGetter({ key: STRING_KEYS.AFFILIATES_LEADERBOARD })} />
        <$Toolbar>
          <AffiliatesFilter
            compactLayout
            selectedFilter={epochFilter}
            filters={affiliatesFilters}
            onChangeFilter={setFilter}
          />
        </$Toolbar>

        <$Table
          withInnerBorders
          data={affiliates}
          getRowKey={(row: IAffiliateStats) => row.rank}
          label={stringGetter({ key: STRING_KEYS.AFFILIATES_LEADERBOARD })}
          columns={columns}
          paginationBehavior="showAll"
          className={className}
        />
      </div>
      {affiliates.length < total && (
        <Button
          action={ButtonAction.Secondary}
          className="notTablet:mx-auto"
          onClick={handleLoadMore}
        >
          {stringGetter({ key: STRING_KEYS.LOAD_MORE })}
        </Button>
      )}
    </div>
  );
};

const $Toolbar = styled(Toolbar)`
  max-width: 100vw;
  overflow: hidden;
  margin-bottom: 0.625rem;
  padding-left: 0.375rem;
  padding-right: 0;

  @media ${breakpoints.desktopSmall} {
    padding-right: 0.375rem;
  }

  @media ${breakpoints.tablet} {
    padding-left: 1rem;
    padding-right: 1rem;
  }
`;

const $Table = styled(Table)<AllTableProps<any>>`
  ${tradeViewMixins.horizontalTable}

  th {
    background: var(--color-layer-2);
  }
`;

const $DesktopOutput = tw(Output)`font-medium-book text-color-text-1`;

const $NumberOutput = tw(Output)`font-base-medium text-color-text-1`;

const $EarningsOutput = styled(Output)`
  color: var(--color-positive);
  font: var(--font-base-medium);
`;

const $AffiliatesFilter = styled.div<{ $compactLayout: boolean }>`
  display: flex;
  flex-direction: ${({ $compactLayout }) => ($compactLayout ? 'row' : 'column')};
  justify-content: space-between;
  gap: 0.75rem;
  flex: 1;
  overflow: hidden;

  ${({ $compactLayout }) =>
    $compactLayout &&
    css`
      @media ${breakpoints.mobile} {
        flex-direction: column;
      }
    `}
`;

const $ToggleGroupContainer = styled.div<{ $compactLayout: boolean }>`
  ${layoutMixins.row}
  justify-content: space-between;
  overflow-x: hidden;
  position: relative;
  --toggle-group-paddingRight: 0.75rem;

  &:after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: var(--toggle-group-paddingRight);
    background: linear-gradient(to right, transparent 10%, var(--color-layer-2));
  }

  ${({ $compactLayout }) =>
    $compactLayout &&
    css`
      & button {
        --button-toggle-off-backgroundColor: ${({ theme }) => theme.toggleBackground};
        --button-toggle-off-textColor: ${({ theme }) => theme.textSecondary};
        --border-color: ${({ theme }) => theme.layer6};
        --button-height: 2rem;
        --button-padding: 0 0.625rem;
        --button-font: var(--font-small-book);
      }
    `}
`;

const $ToggleGroup = styled(ToggleGroup)`
  overflow-x: auto;
  padding-right: var(--toggle-group-paddingRight);
` as typeof ToggleGroup;
