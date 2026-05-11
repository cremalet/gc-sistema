import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

import { computeStatusFd, formatStatusFdLabel } from '@/lib/fd'

// Tipos enxutos pro PDF — só o que o template usa
export type FdItemPdf = {
  data_lancamento: string
  pedido_documento: string | null
  fornecedor: string
  especificacao: string | null
  quantidade: number | null
  valor: number
  valor_descontar: number
  diferenca_favor: number
  data_vencimento: string | null
  data_pagamento: string | null
}

export type ConciliacaoFdProps = {
  empresa: {
    nome: string
    razao_social: string
    cnpj: string | null
    email: string | null
    telefone: string | null
    endereco: string | null
    cidade: string | null
    cep: string | null
    logo_url: string | null
  }
  obra: {
    codigo_obra: string
    nome: string
    cliente_nome: string
  }
  items: FdItemPdf[]
  emitidoPor: string
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 28,
    color: '#1f2937',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '1pt solid #e5e7eb',
  },
  headerLogo: {
    width: 60,
    height: 60,
    marginRight: 12,
    objectFit: 'contain',
  },
  headerInfo: { flex: 1 },
  empresaName: { fontSize: 12, fontWeight: 'bold', color: '#111827' },
  empresaMeta: { fontSize: 8, color: '#6b7280', marginTop: 2 },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
    color: '#111827',
  },
  subtitle: { fontSize: 10, color: '#374151' },

  metaBlock: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 3,
  },
  metaRow: { flexDirection: 'row', marginBottom: 2 },
  metaLabel: { fontWeight: 'bold', color: '#374151', width: 110 },
  metaValue: { color: '#1f2937', flex: 1 },

  table: { borderTop: '1pt solid #d1d5db', borderLeft: '1pt solid #d1d5db' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableRow: { flexDirection: 'row' },
  tableRowAlt: { flexDirection: 'row', backgroundColor: '#fafafa' },
  cell: {
    padding: 4,
    borderRight: '1pt solid #d1d5db',
    borderBottom: '1pt solid #d1d5db',
  },
  cellRight: { textAlign: 'right' },

  // Larguras das colunas (somam ~100%)
  colData: { width: '8%' },
  colPedido: { width: '12%' },
  colFornecedor: { width: '20%' },
  colEspecificacao: { width: '22%' },
  colValor: { width: '12%' },
  colDescontar: { width: '12%' },
  colDiferenca: { width: '14%' },

  totalRow: {
    flexDirection: 'row',
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
  },
  totalCell: {
    padding: 4,
    borderRight: '1pt solid #d1d5db',
    borderBottom: '1pt solid #d1d5db',
  },
  positivo: { color: '#15803d' },
  negativo: { color: '#b91c1c' },

  footer: {
    marginTop: 24,
    paddingTop: 12,
    borderTop: '1pt solid #e5e7eb',
  },
  signatureLine: {
    marginTop: 40,
    width: 220,
    borderTop: '1pt solid #6b7280',
    paddingTop: 4,
    fontSize: 8,
    color: '#6b7280',
  },
  emitidoPor: { fontSize: 7, color: '#9ca3af', marginTop: 12 },

  pageNumber: {
    position: 'absolute',
    bottom: 14,
    right: 28,
    fontSize: 7,
    color: '#9ca3af',
  },
})

function fmtBRL(v: number | null | undefined): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(v ?? 0)
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export function ConciliacaoFdPdf({
  empresa,
  obra,
  items,
  emitidoPor,
}: ConciliacaoFdProps) {
  const totalValor = items.reduce((s, i) => s + Number(i.valor ?? 0), 0)
  const totalDescontar = items.reduce(
    (s, i) => s + Number(i.valor_descontar ?? 0),
    0,
  )
  const totalDiferenca = items.reduce(
    (s, i) => s + Number(i.diferenca_favor ?? 0),
    0,
  )

  const pagos = items.filter((i) => i.data_pagamento != null).length
  const pendentes = items.length - pagos

  const periodoInicio = items.length
    ? items.reduce(
        (min, i) => (i.data_lancamento < min ? i.data_lancamento : min),
        items[0].data_lancamento,
      )
    : null
  const periodoFim = items.length
    ? items.reduce(
        (max, i) => (i.data_lancamento > max ? i.data_lancamento : max),
        items[0].data_lancamento,
      )
    : null

  const empresaMetaParts = [
    empresa.cnpj ? `CNPJ ${empresa.cnpj}` : null,
    empresa.telefone,
    empresa.email,
    empresa.endereco
      ? `${empresa.endereco}${empresa.cidade ? ` — ${empresa.cidade}` : ''}${empresa.cep ? ` — ${empresa.cep}` : ''}`
      : empresa.cidade,
  ].filter(Boolean)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho com logo + dados da empresa */}
        <View style={styles.headerRow}>
          {empresa.logo_url && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={empresa.logo_url} style={styles.headerLogo} />
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.empresaName}>{empresa.razao_social}</Text>
            {empresaMetaParts.length > 0 && (
              <Text style={styles.empresaMeta}>
                {empresaMetaParts.join(' · ')}
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.title}>
          Relatório de Conciliação — Faturamento Direto
        </Text>
        <Text style={styles.subtitle}>
          Obra {obra.codigo_obra} — {obra.nome}
        </Text>

        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Cliente:</Text>
            <Text style={styles.metaValue}>{obra.cliente_nome}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Período:</Text>
            <Text style={styles.metaValue}>
              {periodoInicio && periodoFim
                ? `${fmtDate(periodoInicio)} a ${fmtDate(periodoFim)}`
                : '—'}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Lançamentos:</Text>
            <Text style={styles.metaValue}>
              {items.length} ({pagos} pago{pagos === 1 ? '' : 's'},{' '}
              {pendentes} pendente{pendentes === 1 ? '' : 's'})
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Emitido em:</Text>
            <Text style={styles.metaValue}>
              {new Date().toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>

        {/* Tabela */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.cell, styles.colData]}>Lançamento</Text>
            <Text style={[styles.cell, styles.colPedido]}>Pedido / Doc.</Text>
            <Text style={[styles.cell, styles.colFornecedor]}>Fornecedor</Text>
            <Text style={[styles.cell, styles.colEspecificacao]}>
              Especificação
            </Text>
            <Text style={[styles.cell, styles.colValor, styles.cellRight]}>
              Valor cliente
            </Text>
            <Text style={[styles.cell, styles.colDescontar, styles.cellRight]}>
              Descontamos
            </Text>
            <Text style={[styles.cell, styles.colDiferenca, styles.cellRight]}>
              A favor / Status
            </Text>
          </View>

          {items.map((it, idx) => {
            const status = computeStatusFd(it)
            const diferencaStyle =
              it.diferenca_favor > 0
                ? styles.positivo
                : it.diferenca_favor < 0
                  ? styles.negativo
                  : {}
            return (
              <View
                key={idx}
                style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                wrap={false}
              >
                <Text style={[styles.cell, styles.colData]}>
                  {fmtDate(it.data_lancamento)}
                </Text>
                <Text style={[styles.cell, styles.colPedido]}>
                  {it.pedido_documento ?? '—'}
                </Text>
                <Text style={[styles.cell, styles.colFornecedor]}>
                  {it.fornecedor}
                </Text>
                <Text style={[styles.cell, styles.colEspecificacao]}>
                  {it.especificacao ?? '—'}
                </Text>
                <Text style={[styles.cell, styles.colValor, styles.cellRight]}>
                  {fmtBRL(it.valor)}
                </Text>
                <Text style={[styles.cell, styles.colDescontar, styles.cellRight]}>
                  {fmtBRL(it.valor_descontar)}
                </Text>
                <View style={[styles.cell, styles.colDiferenca]}>
                  <Text style={[styles.cellRight, diferencaStyle]}>
                    {fmtBRL(it.diferenca_favor)}
                  </Text>
                  <Text
                    style={[
                      styles.cellRight,
                      { fontSize: 7, color: '#6b7280' },
                    ]}
                  >
                    {formatStatusFdLabel(status)}
                  </Text>
                </View>
              </View>
            )
          })}

          {/* Totals */}
          {items.length > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalCell, { width: '62%' }]}>TOTAL</Text>
              <Text style={[styles.totalCell, styles.colValor, styles.cellRight]}>
                {fmtBRL(totalValor)}
              </Text>
              <Text style={[styles.totalCell, styles.colDescontar, styles.cellRight]}>
                {fmtBRL(totalDescontar)}
              </Text>
              <Text
                style={[
                  styles.totalCell,
                  styles.colDiferenca,
                  styles.cellRight,
                  totalDiferenca > 0
                    ? styles.positivo
                    : totalDiferenca < 0
                      ? styles.negativo
                      : {},
                ]}
              >
                {fmtBRL(totalDiferenca)}
              </Text>
            </View>
          )}
        </View>

        {/* Footer com assinatura */}
        <View style={styles.footer}>
          <Text>De acordo:</Text>
          <Text style={styles.signatureLine}>
            Assinatura e data — {obra.cliente_nome}
          </Text>
          <Text style={styles.emitidoPor}>
            Documento gerado por {emitidoPor} em{' '}
            {new Date().toLocaleString('pt-BR')} via GC-Sistema.
          </Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}
