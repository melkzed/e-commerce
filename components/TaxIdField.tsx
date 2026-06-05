"use client";

import clsx from "clsx";
import { Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { usePlatformAuth } from "@/components/usePlatformAuth";

type AuthState = ReturnType<typeof usePlatformAuth>;

type BrasilApiCnpjResponse = {
  cnae_fiscal_descricao?: string;
  ddd_telefone_1?: string;
  nome_fantasia?: string;
  razao_social?: string;
};

type TaxIdFieldProps = {
  auth: AuthState;
  required?: boolean;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 14);
}

function hasRepeatedDigits(value: string) {
  return /^(\d)\1+$/.test(value);
}

function formatCpf(digits: string) {
  return digits
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function formatCnpj(digits: string) {
  return digits
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}

function formatTaxId(value: string) {
  const digits = onlyDigits(value);
  return digits.length <= 11 ? formatCpf(digits) : formatCnpj(digits);
}

function isValidCpf(value: string) {
  const digits = onlyDigits(value);

  if (digits.length !== 11 || hasRepeatedDigits(digits)) {
    return false;
  }

  const getCheckDigit = (base: string, initialWeight: number) => {
    let total = 0;

    for (let index = 0; index < base.length; index += 1) {
      total += Number(base[index]) * (initialWeight - index);
    }

    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return (
    getCheckDigit(digits.slice(0, 9), 10) === Number(digits[9]) &&
    getCheckDigit(digits.slice(0, 10), 11) === Number(digits[10])
  );
}

function isValidCnpj(value: string) {
  const digits = onlyDigits(value);

  if (digits.length !== 14 || hasRepeatedDigits(digits)) {
    return false;
  }

  const getCheckDigit = (base: string, weights: number[]) => {
    const total = weights.reduce((sum, weight, index) => sum + Number(base[index]) * weight, 0);
    const rest = total % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  return (
    getCheckDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(digits[12]) &&
    getCheckDigit(digits.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(digits[13])
  );
}

function cleanText(value?: string) {
  return value?.trim() || "";
}

function formatPhone(data: BrasilApiCnpjResponse) {
  const phone = cleanText(data.ddd_telefone_1);
  return phone ? phone.replace(/[^\d()+\-\s]/g, "") : "";
}

export function TaxIdField({ auth, required = false }: TaxIdFieldProps) {
  const [lookupLoading, setLookupLoading] = useState(false);
  const digits = onlyDigits(auth.profile.taxId);
  const isCpf = digits.length > 0 && digits.length <= 11;
  const isCnpj = digits.length > 11;
  const cpfValid = isCpf && digits.length === 11 && isValidCpf(digits);
  const cnpjValid = isCnpj && digits.length === 14 && isValidCnpj(digits);

  const status = useMemo(() => {
    if (!digits) {
      return { label: "Digite CPF ou CNPJ", tone: "muted" };
    }

    if (isCpf) {
      if (digits.length < 11) {
        return { label: "CPF reconhecido", tone: "info" };
      }

      return cpfValid ? { label: "CPF válido", tone: "success" } : { label: "CPF inválido", tone: "danger" };
    }

    if (digits.length < 14) {
      return { label: "CNPJ reconhecido", tone: "info" };
    }

    return cnpjValid ? { label: "CNPJ válido", tone: "success" } : { label: "CNPJ inválido", tone: "danger" };
  }, [cnpjValid, cpfValid, digits, isCpf]);

  const handleChange = (value: string) => {
    auth.handleProfileChange("taxId", formatTaxId(value));
  };

  const handleCnpjLookup = async () => {
    if (!cnpjValid) {
      auth.setProfileNotice("Informe um CNPJ válido para buscar os dados.");
      return;
    }

    setLookupLoading(true);
    auth.setProfileNotice("Buscando CNPJ...");

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);

      if (!response.ok) {
        throw new Error("CNPJ não encontrado");
      }

      const data = (await response.json()) as BrasilApiCnpjResponse;
      const companyName = cleanText(data.nome_fantasia) || cleanText(data.razao_social);
      const phone = formatPhone(data);
      const segment = cleanText(data.cnae_fiscal_descricao);

      if (companyName) {
        auth.handleProfileChange("companyName", companyName);

        if (!auth.profile.storeName.trim()) {
          auth.handleProfileChange("storeName", companyName);
        }
      }

      if (phone && !auth.profile.phone.trim()) {
        auth.handleProfileChange("phone", phone);
      }

      if (segment && !auth.profile.segment.trim()) {
        auth.handleProfileChange("segment", segment);
      }

      auth.setProfileNotice(
        companyName
          ? "CNPJ encontrado. Revise os dados preenchidos e salve o perfil."
          : "CNPJ encontrado, mas a empresa veio sem nome cadastral."
      );
    } catch {
      auth.setProfileNotice("Não foi possível buscar esse CNPJ agora. Confira os números e tente novamente.");
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="tax-id-field">
      <label>
        CPF/CNPJ
        {required && <small>Obrigatório</small>}
        <input
          value={auth.profile.taxId}
          autoComplete="off"
          disabled={auth.taxIdLocked}
          inputMode="numeric"
          maxLength={18}
          name="taxId"
          onChange={(event) => handleChange(event.target.value)}
          placeholder="CPF ou CNPJ"
        />
      </label>

      <div className="tax-id-row">
        <span className={clsx("tax-id-status", `is-${status.tone}`)}>{status.label}</span>
        {isCnpj && !auth.taxIdLocked && (
          <button
            className="secondary-flow-action compact tax-id-search"
            type="button"
            onClick={handleCnpjLookup}
            disabled={!cnpjValid || lookupLoading}
          >
            {lookupLoading ? <Loader2 className="spin" size={15} /> : <Search size={15} />}
            Buscar CNPJ
          </button>
        )}
      </div>
    </div>
  );
}
