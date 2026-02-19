import 'primereact/resources/themes/saga-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'

import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Tag } from 'primereact/tag';
import { LogementService } from '../service/LogementService';
import { LogementDialog } from './LogementDialog';
import axios from 'axios';

export const AppLogementMarie = () => {
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [data, setData] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [displayDialog, setDisplayDialog] = useState(false);
    const dt = useRef(null);

    const STATUS = {
        ADD: 0,
        EDIT: 1,
        DELETE: 2,
    };

    const [status, setStatus] = useState(null);
    const [pfa, setPfa] = useState([]);
    const [existePfa, setExistePfa] = useState(false);
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 10,
        page: 1,
    });

    const idlogement = window.location.pathname.split('/')[3];

    const logementService = new LogementService();

    useEffect(() => {
        setLoading(true);
        logementService.getData({ lazyParams: JSON.stringify(lazyParams), pk: idlogement }).then((resp) => {
            setTotalRecords(resp.count);
            setData(resp.results);
            setLoading(false);
        });
    }, [lazyParams]);

    useEffect(() => {
        if (refresh) {
            setLazyParams({ ...lazyParams });
            setRefresh(false);
        }
    }, [refresh]);

    const alertString = 'Séléctionner un Logement';

    useEffect(() => {
        if (existePfa) {
            axios
                .get('/gestionbatiment/gestionbatiment-serializer/', {
                    params: { lazyParams: JSON.stringify(lazyParams), idpfa: pfa[0].idpfa },
                })
                .then((response) => {
                    setData(response.data.results);
                    setTotalRecords(response.data.count);
                });
        }
    }, [lazyParams, existePfa]);

    useEffect(() => {
        if (refresh) {
            setLazyParams({ ...lazyParams });
            setRefresh(false);
        }
    }, [refresh]);

    const onPage = (event) => {
        const _lazyParams = { ...lazyParams, ...event };
        _lazyParams.page++;
        setLazyParams(_lazyParams);
    };

    const onSort = (event) => {
        const _lazyParams = { ...lazyParams, ...event };
        setLazyParams(_lazyParams);
    };

    const onFilter = (event) => {
        const _lazyParams = { ...lazyParams, ...event };
        _lazyParams.first = 0;
        setLazyParams(_lazyParams);
    };

    const selectionChange = (e) => {
        setSelectedRow(e.value);
    };

    const addClick = () => {
        setStatus(STATUS.ADD);
        setDisplayDialog(true);
    };

    const editClick = () => {
        if (selectedRow == null) {
            alert(alertString);
        } else {
            setStatus(STATUS.EDIT);
            setDisplayDialog(true);
        }
    };

    const deleteClick = () => {
        if (selectedRow == null) {
            alert(alertString);
        } else {
            setStatus(STATUS.DELETE);
            setDisplayDialog(true);
        }
    };

    const paginatorTemplate =
        'CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown';
    const currentPageReportTemplate = 'Affichage du {first} au {last} sur {totalRecords}';
    const emptyMessage = 'Aucun enregistrement trouvé';

    const wrapperStyle = {
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.07)',
    };

    const toolbarStyle = {
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
        border: 'none',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.9rem 1.1rem',
    };

    const titleStyle = {
        fontWeight: 700,
        color: '#0f172a',
        margin: 0,
        letterSpacing: '.2px',
    };

    const subtitleStyle = {
        margin: '0.2rem 0 0',
        fontSize: '.82rem',
        color: '#64748b',
        fontWeight: 500,
    };

    const tableHeaderStyle = {
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 1.2rem',
    };

    const primaryButtonStyle = {
        borderRadius: '10px',
        fontWeight: 600,
        boxShadow: '0 8px 18px rgba(22, 163, 74, 0.18)',
    };

    const warningButtonStyle = {
        borderRadius: '10px',
        fontWeight: 600,
        boxShadow: '0 8px 18px rgba(234, 179, 8, 0.18)',
    };

    const dangerButtonStyle = {
        borderRadius: '10px',
        fontWeight: 600,
        boxShadow: '0 8px 18px rgba(239, 68, 68, 0.16)',
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    label="Ajouter"
                    icon="pi pi-plus"
                    className="p-button-success p-button-sm mr-2"
                    style={primaryButtonStyle}
                    onClick={addClick}
                />
                <Button
                    label="Modifier"
                    icon="pi pi-pencil"
                    className="p-button-warning p-button-sm mr-2"
                    style={warningButtonStyle}
                    onClick={editClick}
                    disabled={!selectedRow}
                />
                <Button
                    label="Supprimer"
                    icon="pi pi-trash"
                    className="p-button-danger p-button-sm"
                    style={dangerButtonStyle}
                    onClick={deleteClick}
                    disabled={!selectedRow}
                />
            </div>
        );
    };

    const header = (
        <div style={tableHeaderStyle} className="table-header d-flex justify-content-between align-items-center">
            <div>
                <h5 style={titleStyle}>Liste des Logements</h5>
                <p style={subtitleStyle}>Gestion centralisée des unités d&apos;hébergement</p>
            </div>
            <Tag value={`${totalRecords} enregistrements`} severity="info" rounded />
        </div>
    );

    const situationBodyTemplate = (rowData) => {
        const severity = rowData.situation === 'OCCUPE' ? 'danger' : 'success';
        return <Tag value={rowData.situation} severity={severity} rounded style={{ fontWeight: 600 }} />;
    };

    const etatBodyTemplate = (rowData) => {
        if (rowData.etat) {
            return <Tag value={rowData.etat} severity="info" rounded style={{ fontWeight: 600 }} />;
        }
        return null;
    };

    return (
        <>
            <div className="card my-3" style={wrapperStyle}>
                <Toolbar className="mb-0" left={leftToolbarTemplate} style={toolbarStyle} />
                <div style={{ padding: '0.15rem 0.8rem 0.8rem' }}>
                    <DataTable
                        ref={dt}
                        value={data}
                        lazy
                        header={header}
                        paginatorTemplate={paginatorTemplate}
                        currentPageReportTemplate={currentPageReportTemplate}
                        paginator
                        first={lazyParams.first}
                        rows={10}
                        totalRecords={totalRecords}
                        onPage={onPage}
                        onSort={onSort}
                        sortField={lazyParams.sortField}
                        sortOrder={lazyParams.sortOrder}
                        onFilter={onFilter}
                        filters={lazyParams.filters}
                        loading={loading}
                        selection={selectedRow}
                        onSelectionChange={selectionChange}
                        selectionMode="single"
                        emptyMessage={emptyMessage}
                        responsiveLayout="scroll"
                        stripedRows
                        showGridlines
                        className="p-datatable-sm"
                        style={{ borderRadius: '14px', overflow: 'hidden' }}
                    >
                        <Column field="idunite__abreviation" header="Unité" sortable filter filterMatchMode="contains" />
                        <Column
                            field="idtypelogement__libelle"
                            header="Catégorie logement"
                            sortable
                            filter
                            filterMatchMode="icontains"
                        />
                        <Column field="typelogement" header="Catégorie bénificaire" sortable filter filterMatchMode="icontains" />
                        <Column field="numlogement" header="Adresse Logement" sortable filter filterMatchMode="icontains" />
                        <Column field="genre" header="Genre" sortable filter filterMatchMode="icontains" />
                        <Column field="etat" header="Etat" body={etatBodyTemplate} sortable filter filterMatchMode="icontains" />
                        <Column field="superficiee" header="Superficiee" sortable filter filterMatchMode="icontains" />
                        <Column
                            field="situation"
                            header="Situation"
                            body={situationBodyTemplate}
                            sortable
                            filter
                            filterMatchMode="icontains"
                        />
                        <Column field="observation" header="Observation" sortable filter filterMatchMode="icontains" />
                    </DataTable>
                </div>
            </div>

            <LogementDialog
                status={status}
                selectedRow={selectedRow}
                display={displayDialog}
                setDisplay={setDisplayDialog}
                setRefresh={setRefresh}
                idlogement={idlogement}
            />
        </>
    );
};
